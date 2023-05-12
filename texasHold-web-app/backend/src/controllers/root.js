const rootController = {};

rootController.main =(req,res)=>{
    res.render('index', {user:res.locals.user});
};

module.exports = rootController;