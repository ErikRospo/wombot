## Rate limiting
If you get an error similar to the one below, just wait a minute before trying again.
```
RestError: {"detail":"User has been rate-limited"}
    at IncomingMessage.<anonymous> (/home/****/Wombo/wombot/rest.js:112:56)
    at IncomingMessage.emit (node:events:525:35)
    at endReadableNT (node:internal/streams/readable:1359:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  hostname: 'paint.api.wombo.ai',
  path: '/api/tasks/'
}
/home/****/Wombo/wombot/index.js:77
        throw new Error(`Error while allocating a new task:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
              ^

Error: Error while allocating a new task:
RestError(hostname = "paint.api.wombo.ai", path = "/api/tasks/"): "{"detail":"User has been rate-limited"}"
    at task (/home/****/Wombo/wombot/index.js:77:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Promise.all (index 1)
    at async main (/home/****/Wombo/wombot/multirun.js:70:9)
```

## Not premium
If you get an error similar to the one below, check your styles, and make sure you aren't using any premium styles. 
```
RestError: {"detail":"not premium :( don't abuse API pls, email talha@wombo.ai for api access"}
    at IncomingMessage.<anonymous> (/home/****/Wombo/wombot/rest.js:112:56)
    at IncomingMessage.emit (node:events:525:35)
    at endReadableNT (node:internal/streams/readable:1359:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  hostname: 'paint.api.wombo.ai',
  path: '/api/tasks/57bb2faa-c10c-4720-be70-70f15c0b3df5'
}
/home/****/Wombo/wombot/index.js:107
        throw new Error(`Error while sending prompt:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
              ^

Error: Error while sending prompt:
RestError(hostname = "paint.api.wombo.ai", path = "/api/tasks/57bb2faa-c10c-4720-be70-70f15c0b3df5"): "{"detail":"not premium :( don't abuse API pls, email talha@wombo.ai for api access"}"
    at task (/home/****/Wombo/wombot/index.js:107:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Promise.all (index 2)
    at async main (/home/****/Wombo/wombot/multirun.js:80:5)
```

## Unauthorized style
If you get an error like the one below, make sure that the style exists by typing `node cli.js --help` for a list of styles.
```
RestError: {"detail":"Unauthorized style: 90 requested for task: d69a92d7-23db-42a3-8a2b-4823887125ab"}
    at IncomingMessage.<anonymous> (/home/****/Wombo/wombot/rest.js:112:56)
    at IncomingMessage.emit (node:events:525:35)
    at endReadableNT (node:internal/streams/readable:1359:12)
    at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
  hostname: 'paint.api.wombo.ai',
  path: '/api/tasks/d69a92d7-23db-42a3-8a2b-4823887125ab'
}
/home/****/Wombo/wombot/index.js:107
        throw new Error(`Error while sending prompt:\n${err.toFriendly ? err.toFriendly() : err.toString()}`);
              ^

Error: Error while sending prompt:
RestError(hostname = "paint.api.wombo.ai", path = "/api/tasks/d69a92d7-23db-42a3-8a2b-4823887125ab"): "{"detail":"Unauthorized style: 90 requested for task: d69a92d7-23db-42a3-8a2b-4823887125ab"}"
    at task (/home/****/Wombo/wombot/index.js:107:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Promise.all (index 0)
    at async main (/home/****/Wombo/wombot/multirun.js:70:9)
```