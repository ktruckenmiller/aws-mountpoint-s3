#!/bin/sh -e

mkdir -p /mnt/$S3_MOUNTPOINT
mount-s3 --allow-delete $S3_BUCKET $S3_MOUNTPOINT