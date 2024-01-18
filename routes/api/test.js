var ans = {};

var demands = await Demand.find({employee: employee});
for(let i=0; i<demands.length; i++) {
    var demand = demands[i];
    var transactions = await transaction.find({"$and": [{"type": "DEMAND"}, {"reference.demand": demand}]});
    for(let j=0; j<transactions.length; j++) {
        var transaction = transactions[j];
        var done = false;
        var item = await Stationery.findById(transaction.item).select("name");
        for (let k in ans) {
            if(k===item.name) {
                ans[k] = {
                    quantity: ans[k].quantity+transaction.quantity,
                    transactions: [
                        ...ans[k].transactions,
                        {
                            "quantity": transaction.quantity,
                            "date": demand.date
                        }
                    ]
                }
                // console.log(ans);
                done=true;
            }
        }
        if(done===false) {
            // console.log("adding");
            ans[item.name] = {
                quantity: transaction.quantity,
                transactions: [
                    {
                        "quantity": transaction.quantity,
                        "date": demand.date
                    }
                ]
            }
            // console.log(ans);
        }
        // done=false;
    }
}


/*

C:\works\NodeProjects\records\node_modules\mongoose\lib\drivers\node-mongodb-native\collection.js:186
          const err = new MongooseError(message);
                      ^

MongooseError: Operation `employees.findOne()` buffering timed out after 10000ms
    at Timeout.<anonymous> (C:\works\NodeProjects\records\node_modules\mongoose\lib\drivers\node-mongodb-native\collection.js:186:23)
    at listOnTimeout (node:internal/timers:573:17)
    at process.processTimers (node:internal/timers:514:7)

Node.js v20.10.0
[nodemon] app crashed - waiting for file changes before starting...
[nodemon] restarting due to changes...
[nodemon] starting `node index.js`
✓ Listening on port 5000. Visit http://localhost:5000/ in your browser.
✓ MongoDB Connected!
C:\works\NodeProjects\records\node_modules\mongodb\lib\sdam\topology.js:276
            const timeoutError = new error_1.MongoServerSelectionError(`Server selection timed out after ${options.serverSelectionTimeoutMS} ms`, this.description);
                                 ^

MongoServerSelectionError: connect ECONNREFUSED 13.127.52.17:27017
    at EventTarget.<anonymous> (C:\works\NodeProjects\records\node_modules\mongodb\lib\sdam\topology.js:276:34)
    at [nodejs.internal.kHybridDispatch] (node:internal/event_target:814:20)
    at EventTarget.dispatchEvent (node:internal/event_target:749:26)
    at abortSignal (node:internal/abort_controller:371:10)
    at TimeoutController.abort (node:internal/abort_controller:393:5)
    at Timeout.<anonymous> (C:\works\NodeProjects\records\node_modules\mongodb\lib\utils.js:1010:92)
    at listOnTimeout (node:internal/timers:573:17)
    at process.processTimers (node:internal/timers:514:7) {
  reason: TopologyDescription {
    type: 'ReplicaSetNoPrimary',
    servers: Map(3) {
      'ac-cpu1xjg-shard-00-00.59olk6t.mongodb.net:27017' => ServerDescription {
        address: 'ac-cpu1xjg-shard-00-00.59olk6t.mongodb.net:27017',
        type: 'RSSecondary',
        hosts: [
          'ac-cpu1xjg-shard-00-00.59olk6t.mongodb.net:27017',
          'ac-cpu1xjg-shard-00-01.59olk6t.mongodb.net:27017',
          'ac-cpu1xjg-shard-00-02.59olk6t.mongodb.net:27017'
        ],
        passives: [],
        arbiters: [],
        tags: {
          availabilityZone: 'aps1-az1',
          workloadType: 'OPERATIONAL',
          diskState: 'READY',
          region: 'AP_SOUTH_1',
          provider: 'AWS',
          nodeType: 'ELECTABLE'
        },
        minWireVersion: 0,
        maxWireVersion: 17,
        roundTripTime: 135.67200000000003,
        lastUpdateTime: 146560491,
        lastWriteDate: 2024-01-17T22:39:08.000Z,
        error: null,
        topologyVersion: {
          processId: ObjectId { [Symbol(id)]: [Buffer [Uint8Array]] },
          counter: 4
        },
        setName: 'atlas-qtjgmm-shard-0',
        setVersion: 2,
        electionId: null,
        logicalSessionTimeoutMinutes: 30,
        primary: 'ac-cpu1xjg-shard-00-02.59olk6t.mongodb.net:27017',
        me: 'ac-cpu1xjg-shard-00-00.59olk6t.mongodb.net:27017',
        '$clusterTime': {
          clusterTime: Timestamp { low: 1, high: 1705531148, unsigned: true },
          signature: { hash: [Binary], keyId: [Long] }
        }
      },
      'ac-cpu1xjg-shard-00-02.59olk6t.mongodb.net:27017' => ServerDescription {
        address: 'ac-cpu1xjg-shard-00-02.59olk6t.mongodb.net:27017',
        type: 'Unknown',
        hosts: [],
        passives: [],
        arbiters: [],
        tags: {},
        minWireVersion: 0,
        maxWireVersion: 0,
        roundTripTime: -1,
        lastUpdateTime: 146563239,
        lastWriteDate: 0,
        error: MongoNetworkError: connect ECONNREFUSED 13.127.52.17:27017
            at connectionFailureError (C:\works\NodeProjects\records\node_modules\mongodb\lib\cmap\connect.js:379:20)
            at TLSSocket.<anonymous> (C:\works\NodeProjects\records\node_modules\mongodb\lib\cmap\connect.js:285:22)
            at Object.onceWrapper (node:events:629:26)
            at TLSSocket.emit (node:events:514:28)
            at emitErrorNT (node:internal/streams/destroy:151:8)
            at emitErrorCloseNT (node:internal/streams/destroy:116:3)
            at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
          [Symbol(errorLabels)]: Set(1) { 'ResetPool' },
          [cause]: Error: connect ECONNREFUSED 13.127.52.17:27017
              at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1595:16) {
            errno: -4078,
            code: 'ECONNREFUSED',
            syscall: 'connect',
            address: '13.127.52.17',
            port: 27017
          }
        },
        topologyVersion: null,
        setName: null,
        setVersion: null,
        electionId: null,
        logicalSessionTimeoutMinutes: null,
        primary: null,
        me: null,
        '$clusterTime': null
      },
      'ac-cpu1xjg-shard-00-01.59olk6t.mongodb.net:27017' => ServerDescription {
        address: 'ac-cpu1xjg-shard-00-01.59olk6t.mongodb.net:27017',
        type: 'RSSecondary',
        hosts: [
          'ac-cpu1xjg-shard-00-00.59olk6t.mongodb.net:27017',
          'ac-cpu1xjg-shard-00-01.59olk6t.mongodb.net:27017',
          'ac-cpu1xjg-shard-00-02.59olk6t.mongodb.net:27017'
        ],
        passives: [],
        arbiters: [],
        tags: {
          diskState: 'READY',
          workloadType: 'OPERATIONAL',
          provider: 'AWS',
          availabilityZone: 'aps1-az3',
          nodeType: 'ELECTABLE',
          region: 'AP_SOUTH_1'
        },
        minWireVersion: 0,
        maxWireVersion: 17,
        roundTripTime: 119.68000000000002,
        lastUpdateTime: 146560505,
        lastWriteDate: 2024-01-17T22:39:08.000Z,
        error: null,
        topologyVersion: {
          processId: ObjectId { [Symbol(id)]: [Buffer [Uint8Array]] },
          counter: 3
        },
        setName: 'atlas-qtjgmm-shard-0',
        setVersion: 2,
        electionId: null,
        logicalSessionTimeoutMinutes: 30,
        primary: 'ac-cpu1xjg-shard-00-02.59olk6t.mongodb.net:27017',
        me: 'ac-cpu1xjg-shard-00-01.59olk6t.mongodb.net:27017',
        '$clusterTime': {
          clusterTime: Timestamp { low: 1, high: 1705531148, unsigned: true },
          signature: { hash: [Binary], keyId: [Long] }
        }
      }
    },
    stale: false,
    compatible: true,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    setName: 'atlas-qtjgmm-shard-0',
    maxElectionId: ObjectId {
      [Symbol(id)]: Buffer(12) [Uint8Array] [
        127, 255, 255, 255, 0,
          0,   0,   0,   0, 0,
          0,  16
      ]
    },
    maxSetVersion: 2,
    commonWireVersion: 0,
    logicalSessionTimeoutMinutes: 30
  },
  code: undefined,
  [Symbol(errorLabels)]: Set(0) {},
  [cause]: MongoNetworkError: connect ECONNREFUSED 13.127.52.17:27017
      at connectionFailureError (C:\works\NodeProjects\records\node_modules\mongodb\lib\cmap\connect.js:379:20)
      at TLSSocket.<anonymous> (C:\works\NodeProjects\records\node_modules\mongodb\lib\cmap\connect.js:285:22)
      at Object.onceWrapper (node:events:629:26)
      at TLSSocket.emit (node:events:514:28)
      at emitErrorNT (node:internal/streams/destroy:151:8)
      at emitErrorCloseNT (node:internal/streams/destroy:116:3)
      at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
    [Symbol(errorLabels)]: Set(1) { 'ResetPool' },
    [cause]: Error: connect ECONNREFUSED 13.127.52.17:27017
        at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1595:16) {
      errno: -4078,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '13.127.52.17',
      port: 27017
    }
  }
}

Node.js v20.10.0
[nodemon] app crashed - waiting for file changes before starting...
[nodemon] restarting due to changes...
[nodemon] starting `node index.js`
✓ Listening on port 5000. Visit http://localhost:5000/ in your browser.
MongooseServerSelectionError: connect ECONNREFUSED 13.127.52.17:27017
[nodemon] restarting due to changes...
[nodemon] starting `node index.js`
✓ Listening on port 5000. Visit http://localhost:5000/ in your browser.
MongooseServerSelectionError: connect ECONNREFUSED 13.127.52.17:27017


*/