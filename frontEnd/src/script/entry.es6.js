;(function () {
    app.setRootLocation('/home/view');
    var Router = app.Router;
    var entryApp = document.getElementById('entryApp');
    var loginRouter = new Router();
    var userRouter = new Router();
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
    userRouter = userRouter.route('/user', function (next) {
        if (!localStorage.getItem('userInf')) {
            alert('请登录');
            return app.redirect('', '/login')
        };
        next();
    })
    traineeIndexRouter = userRouter.route('/trainee', function (next) {
        changeTitle('学员主页');
        this.render('/static/html/trainee.html', entryApp)
            .then(function () {
                next();
            });
    });
    teacherIndexRouter = userRouter.route('/teacher', function (next) {
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
}());