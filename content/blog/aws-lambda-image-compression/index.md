---
title: "Leveraging AWS Lambda for Image Compression at scale"
date: "2017-09-17"
redirect_from:
  - /2017/09/17/leveraging-aws-lambda-for-image-compression-at-scale/
---

![](https://ktbt10.files.wordpress.com/2017/09/e83ba-1vfbwrzfzj-srjdv_qr80vq.png)

A lot of problems we solve at Squad deal with images. Images to be tagged, labeled, moderated, transcribed etc. And there is this thing about images, they are generally heavier than text, digitally. And if our contractors (users of our app) spend more money on internet packs/plans than what they earn, or if they have to wait longer for the image to download because they have a slow/bad connection, their ROI from using Squad is no more justified.

# Once, there lived a simple program…

No points for guessing, we compress the images on our end before we send it out to our contractors.

The client sends us, what we call, a “Data Unit” (basically a JSON containing all the data, like text, images, etc. pertaining to one particular item). Each data unit can contain multiple images. And all of these need to be compressed. Our current architecture involves sending a task (using [Celery](http://www.celeryproject.org/)) to our queue ([RabbitMQ](https://www.rabbitmq.com/)). These tasks get consumed by celery workers who are listening to the queue. Each worker picks up a task, which holds the ID of one data unit, loops over each URL, downloads it, compresses it, and then uploads it to a bucket in S3.

![](https://ktbt10.files.wordpress.com/2017/09/12ea7-144kuzuj-324ptwdglvddtw.png)

Sorted.

This simple solution served us well. **We had 4 workers that were able to process 3-4 Data Units per second on average**. Of course, if a Data Unit had more images, it would take more time for that particular Data Unit. **This was really slow.** And as we are looking at getting more data every second and every hour, this would just not scale. At the current rate, we would just be able to process 10k data units per hour. **We set out to change this to 100k per hour, with the provision of increasing this rate to 1 million per hour with simple and minimal horizontal scaling.**

# The Upgrade

We figured the only way to do this was if:

1. the downloading, compressing and uploading to S3 could all happen somewhere outside of our servers,
2. asynchronously.
3. And something that could scale infinitely, without us having to manage the infrastructure.

The answer for us was [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html) which has all these features, plus is [dirt cheap](https://aws.amazon.com/lambda/pricing/).

We made a Lambda function that will take an URL and put the compressed version of it in S3 at a predefined location. But since we got multiple images per Data Unit, and we didn’t want to make HTTP calls in a loop (because they are costly as well), we created one more orchestrator Lambda function that took a list of URLs and for each URL hit the original Lambda function. And now each Data Unit for us is just one triggering of a lambda function. **We hit rates of 30–40 Data Units per second, which is straight away a 10x growth.**

![](https://ktbt10.files.wordpress.com/2017/09/25da1-1hzqohfvyrzse0kqrj0d2ma.png)

And this is essentially with half the number of workers because we are using the other half workers to check if the compression happened and if the URL was not broken. We straight away hit our goal. And since we get more throughput from individual workers, adding even a single one will increase the rate by a lot. _But there is another way this can scale._ Right now each worker just sends images of one Data Unit at one time. Since all we are doing is trigger the lambda function with a list of URLs, we can club URLs from multiple Data Units and send them all at once. That directly means performance gain in the order of `n`, _where n is the number of Data Units you club_. This lets us scale it further to an insane rate!

# Giveaways

It was straightforward to set up PIL for AWS Lambda, you just have to follow the [provided docs](http://docs.aws.amazon.com/lambda/latest/dg/with-s3-example-deployment-pkg.html) really well. Fire up an EC2, with Amazon’s Linux image, and install Pillow, and then package this in a zip and download it. See?

No worries, we took the pain so you don’t have to. **You can find the site packages zip along with the image compression and the orchestrator Lambda functions [here in our repository](https://github.com/squadrun/lambda-image-compression).** Break a leg!

(Originally [posted on my Medium account](https://medium.com/squad-engineering/leveraging-aws-lambda-for-image-compression-at-scale-a01afd756a12))
