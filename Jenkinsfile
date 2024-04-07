pipeline {
  agent any

  environment {
    AWS_DEFAULT_REGION = 'us-east-1'
    ECR_REGISTRY = '058264545728.dkr.ecr.us-east-1.amazonaws.com'
    ECR_REPOSITORY = 'clcm3506-backend'
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
  }
}