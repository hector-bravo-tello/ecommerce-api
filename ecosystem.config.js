// use it with pm2

module.exports = {
  apps : [{
    script: 'server.js',
    instances : '1',
    exec_mode : 'cluster',
    watch: false
  }],

};
