pipeline {
  agent any

  environment {
    AWS_DEFAULT_REGION = 'us-east-1'
    ECR_REGISTRY = '058264545728.dkr.ecr.us-east-1.amazonaws.com'
    ECR_REPOSITORY = 'clcm3506-backend'
    ECS_CLUSTER = 'clcm3506-cluster'
    ECS_SERVICE = 'clcm3506-backend-service'
    IMAGE_TAG = "${env.GIT_COMMIT}"
  }

  stages {
    stage('Checkout code') {
      steps {
        checkout scm
      }
    }

    stage('Build, tag, and push image to Amazon ECR') {
      steps {
        sh 'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY'
        sh 'docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .'
        sh 'docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG'
      }
    }

    stage('Fill in the new image ID in the Amazon ECS task definition') {
      steps {
        sh '''
          jq '.containerDefinitions[].image = "'$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG'"' task-definition.json > new-task-definition.json
        '''
      }
    }

    stage('Register new task definition') {
      steps {
        script {
          def taskDefinitionArn = sh(script: 'aws ecs register-task-definition --cli-input-json file://new-task-definition.json --query taskDefinition.taskDefinitionArn --output text', returnStdout: true).trim()
          env.TASK_DEFINITION_ARN = taskDefinitionArn
        }
      }
    }

    stage('Deploy Amazon ECS task definition') {
      steps {
        sh 'aws ecs update-service --cluster clcm3506-cluster --service clcm3506-backend-service --task-definition $TASK_DEFINITION_ARN'
      }
    }

    stage('Scan open ports of ECS container') {
      steps {
        script {
          def taskArn = sh(script: "aws ecs list-tasks --cluster $ECS_CLUSTER --service-name $ECS_SERVICE --query taskArns[0] --output text", returnStdout: true).trim()
          def containerInstanceArn = sh(script: "aws ecs describe-tasks --cluster $ECS_CLUSTER --tasks $taskArn --query tasks[0].containerInstanceArn --output text", returnStdout: true).trim()
          def instanceId = sh(script: "aws ecs describe-container-instances --cluster $ECS_CLUSTER --container-instances $containerInstanceArn --query containerInstances[0].ec2InstanceId --output text", returnStdout: true).trim()
          def publicIpAddress = sh(script: "aws ec2 describe-instances --instance-ids $instanceId --query Reservations[0].Instances[0].PublicIpAddress --output text", returnStdout: true).trim()
          def nmapOutput = sh(script: "nmap -F $publicIpAddress", returnStdout: true).trim()
          if (nmapOutput.contains("22/tcp open")) {
            error("Port 22 is open on the ECS container instance!")
          }
        }
      }
    }
  }
}