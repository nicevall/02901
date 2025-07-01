module.exports = {
    apps: [{
        name: 'BACKEND-GEOASISTENCIA:80',
        script: 'app.js',

        watch: false, 
        ignore_watch: ['node_modules', 'logs', 'err.log', 'out.log', 'src'], 
        autorestart: false, 
        restart_delay: 30000, 
        max_restarts: 10, 
        exp_backoff_restart_delay: 100, 
    }]
};
