# Web Scraping and Async Jobs

### Creating an async job

1. Install bullmq for implementing queues

```bash
npm install --save @nestjs/bullmq bullmq
```

2. Register Bull Module in App and specify redis server credentials

```
BullMQ needs to run on a server-like envrionment because its a background job processing system and have essential components like
- Redis for data storage for queues
- It uses separate Node.js processes called **Workers** to actually do something. They run independently from your web server to prevent blocking

Server environment basically setup in `app.module.ts` file.
```

3. Register a queue and add a new job

```
First you need to register a queue in the module you want to use it. Then in controller or service, we can inject our job and add a new job. By default, whenever a job is created, its in the waiting state untill a worker starts processing it.
```
