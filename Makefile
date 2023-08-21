BUCKET_NAME ?= "kloudcover"
AWS_PROFILE ?= "kloudcover"
build:
	docker build -t ktruckenmiller/aws-mountpoint-s3 .

push: build
	docker push ktruckenmiller/aws-mountpoint-s3

run: build
	docker run -it --rm \
	-e AWS_SECRET_ACCESS_KEY \
	-e AWS_ACCESS_KEY_ID \
	-e AWS_SESSION_TOKEN \
	-e AWS_REGION \
	-e S3_BUCKET=${BUCKET_NAME} \
	-e S3_MOUNTPOINT=/mnt/${BUCKET_NAME} \
	-v ${HOME}/.aws:/root/.aws:ro \
	--privileged --cap-add SYS_ADMIN \
	--device /dev/fuse ktruckenmiller/aws-mountpoint-s3