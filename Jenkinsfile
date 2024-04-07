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

    stage('Download task definition') {
      steps {
        sh 'aws ecs describe-task-definition --task-definition clcm3506-task --query taskDefinition > task-definition.json'
      }
    }

    stage('Fill in the new image ID in the Amazon ECS task definition') {
      steps {
        sh '''
          jq '.containerDefinitions[].image = "'$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG'"' task-definition.json > task-definition-updated.json
          mv task-definition-updated.json task-definition.json
        '''
      }
    }

    stage('Register new task definition') {
      steps {
        script {
          def output = sh(script: 'aws ecs register-task-definition --cli-input-json file://task-definition.json', returnStdout: true)
          def jsonOutput = readJSON text: output
          env.TASK_DEFINITION_ARN = jsonOutput.taskDefinition.taskDefinitionArn
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