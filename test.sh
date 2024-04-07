#!/bin/bash
ECS_CLUSTER='clcm3506-cluster'
ECS_SERVICE='clcm3506-backend-service'

# Get the ARN of the first task in the ECS service
taskArn=$(aws ecs list-tasks --cluster $ECS_CLUSTER --service-name $ECS_SERVICE --query taskArns[0] --output text)

# Get the ARN of the container instance that is running the task
containerInstanceArn=$(aws ecs describe-tasks --cluster $ECS_CLUSTER --tasks $taskArn --query tasks[0].containerInstanceArn --output text)

# Get the ID of the EC2 instance that is hosting the container instance
instanceId=$(aws ecs describe-container-instances --cluster $ECS_CLUSTER --container-instances $containerInstanceArn --query containerInstances[0].ec2InstanceId --output text)

# Get the public IP address of the EC2 instance
publicIpAddress=$(aws ec2 describe-instances --instance-ids $instanceId --query Reservations[0].Instances[0].PublicIpAddress --output text)

# Scan the open ports of the ECS container instance
echo ${publicIpAddress}
# nmap -F $publicIpAddress