BUCKET_NAME ?= "kloudcover"
AWS_PROFILE ?= "kloudcover"
build:
	docker build -t ktruckenmiller/s3-mount --build-arg bucket_name=${BUCKET_NAME} .

push: build
	docker push ktruckenmiller/s3-mount

run: build
	docker run -it --rm \
	-e AWS_SECRET_ACCESS_KEY \
	-e AWS_ACCESS_KEY_ID \
	-e AWS_SESSION_TOKEN \
	-e AWS_REGION \
	-v ${HOME}/.aws:/root/.aws:ro \
	--privileged --cap-add SYS_ADMIN \
	--device /dev/fuse ktruckenmiller/s3-mount \
	--allow-delete ${BUCKET_NAME} /${BUCKET_NAME} 