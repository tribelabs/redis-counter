var async = require('async')

module.exports = (redis) => {
  var increase = (key) => {
    return new Promise((resolve, reject) => {
      redis.get(key, (error, count) => {
        if (error) {
          console.log('Getting of', key, 'failed', error)
        }

        count = +count || 0
        count++

        redis.set(key, count, () => {
          resolve()
        })
      })
    })
  }

  var q = async.queue((task, callback) => {
    if (task.name === 'increase') {
      increase(task.key)
      .then(() => {
        callback()
      })
      .catch((error) => {
        console.warn('Increasing of pns count failed', error)
        callback()
      })
    }
  })

  return {
    increase: (key) => {
      if (!key) {
        throw new Error('Missing key to increase')
      }

      q.push({
        name: 'increase',
        key: key
      })
    }
  }
}
