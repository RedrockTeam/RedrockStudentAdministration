;(function () {
    app.setRootLocation('/home');
    var Router = app.Router;
    var entryApp = document.getElementById('entryApp');
    var loginRouter = new Router();
    var traineeRouter = new Router();
    var teacherRouter = new Router();
    var traineeIndexRouter;
    var teacherIndexRouter;
    var changeTitle = (function () {
        var navbarTitle = document.getElementById('navbar-title');
        return function (val) {
            navbarTitle.innerHTML = val;
        }
    }());
    app.use(routeHbsMiddleware(app.getRootLocation()));

    loginRouter.route('/login', function (next) {
        changeTitle('登陆');
        this.render('/static/html/login.html', entryApp)
            .then(function () {
                next();
            });
    });
    traineeIndexRouter = traineeRouter.route('/trainee', function (next) {
        changeTitle('学员主页');
        this.render('/static/html/trainee.html', entryApp)
            .then(function () {
                next();
            });
    });
    teacherIndexRouter = teacherRouter.route('/teacher', function (next) {
        changeTitle('管理员主页');
        this.render('/static/html/teacher.html', entryApp)
            .then(function () {
                next();
            });
    });
    traineeIndexRouter.route('/my_inf');
    traineeIndexRouter.route('/my_work');
    traineeIndexRouter.route('/my_lesson');
    teacherIndexRouter.route('/people_administration');
    teacherIndexRouter.route('/work_administration');
    teacherIndexRouter.route('/watch_homework');
    teacherIndexRouter.route('/lesson_administration');

    window.traineeIndexRouter = traineeIndexRouter;
    window.teacherIndexRouter = teacherIndexRouter;
    // app.redirect('', '/teacher/watch_homework');
    // app.redirect('', '/login');
}());