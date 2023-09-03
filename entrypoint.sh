#!/bin/sh -ex

mkdir -p ${S3_MOUNTPOINT}
mount-s3 -f --allow-delete --allow-root ${S3_BUCKET} ${S3_MOUNTPOINT}