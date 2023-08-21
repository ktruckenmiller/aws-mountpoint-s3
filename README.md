# aws-mountpoint-s3
A docker example for using s3 mountpoint


## How to use

The docker container needs permissions to access s3, so the easiest way is to mount the creds.

```
docker run -it --rm \
	-v ${HOME}/.aws:/root/.aws:ro \
    -e S3_MOUNTPOINT=my-bucket \
    -e S3_MOUNTPOINT_PATH=/my-bucket \
	--privileged --cap-add SYS_ADMIN \
	--device /dev/fuse \
    ktruckenmiller/aws-mountpoint-s3
```

## Environment Variables

| Variable | Description | Default |
| -------- | ----------- | ------- |
| S3_MOUNTPOINT | The name of the s3 bucket | my-bucket |
| S3_MOUNTPOINT_PATH | The path to mount the s3 bucket | /my-bucket |

## Docker Hub

https://hub.docker.com/r/ktruckenmiller/aws-mountpoint-s3/

## ECS/EC2 Container Definition 

> Doesn't support Fargate yet

```
{
  "name": "my-bucket",
  "image": "ktruckenmiller/aws-mountpoint-s3",
  "memory": 128,
  "cpu": 128,
  "essential": true,
  "environment": [
    {
      "name": "S3_MOUNTPOINT",
      "value": "my-bucket"
    },
    {
      "name": "S3_MOUNTPOINT_PATH",
      "value": "/my-bucket"
    }
  ],
  "mountPoints": [
    {
      "sourceVolume": "my-bucket",
      "containerPath": "/my-bucket",
      "readOnly": false
    }
  ],
  "volumesFrom": []
}
```