/**
 * 视频播放器
 * 
 * 内核：ckplayer6.8
 * 
 * 插件：
 * 1. m3u8直播流插件3.0
 * 2. 清晰度插件3.0
 * 
 * @author J.Soon <serdeemail@gmail.com>
 */

/**
 * CKP构造函数
 * 用于保存用户定义的事件函数，以及播放器插件的拓展
 */
window.CKP = window.CKP ? new Error('CKP命名空间冲突!') : function () {
    return this;
};

/**
 * 视频播放器模块函数
 * 
 * @param {object}      params
 * @param {string}      params.domId        视频所在容器的id
 * @param {number}      params.width        播放器宽度
 * @param {number}      params.height       播放器高度
 * @param {boolean}     params.m3u8         是否是m3u8直播流
 * 
 * 事件回调函数
 * 注：回调函数的第一个参数都是that，即封装好的播放器模块对象videoPlayer()
 * 这么做的好处是：
 * 对外隐藏ckplayer对象，防止外部直接操作ckplayer，一切的操作都由that来进行
 * @param {function}    params.onPlayerLoad         播放器加载完成
 * @param {function}    params.onPlay               开始播放    
 * @param {function}    params.onPause              暂停播放    
 * @param {function}    params.onBuffer             缓冲    
 * @param {function}    params.onTiming             播放时间改变    
 * @param {function}    params.onMuted              静音    
 * @param {function}    params.onVolumeChange       音量改变    
 * @param {function}    params.onError              播放出错    
 * @param {function}    params.onNewVideo           新建视频    
 * @param {function}    params.onVideoLoad          分析视频   
 * @param {function}    params.onSendNetStream      接收到视频流    
 * @param {function}    params.onLoadedMetadata     完成视频元数据信息分析   
 * @param {function}    params.onLoadComplete       视频加载完成
 * @param {function}    params.onSeeking            视频跳转时间  
 * @param {function}    params.onProgressBarOver    鼠标在进度栏上移动
 * @param {function}    params.onProgressBarDown    鼠标在进度栏上单击
 * @param {function}    params.onFrontAdStart       加载前置广告
 * @param {function}    params.onFrontAdSkip        "跳过广告"按钮被点击
 * @param {function}    params.onQualityChange      清晰度切换
 * 
 * 方法控制函数
 * @param {function}    params.play      播放视频
 * 
 */
var videoPlayer = function (params) {

    var that = {}; // 对外暴露接口的对象

    // 播放器信息
    that.player = {
        /**
         * 播放器实例对象（初始化视频播放器后赋值）
         * 这个实际上就是embed元素，也即是ckplayer.swf
         */
        o: null,
        domId: params.domId, // 视频所在容器的id
        playerId: 'ckplayer_' + this.domId, // 播放器id
        width: params.width || 600, // 播放器宽度
        height: params.height || 400 // 播放器高度
    };

    // 私有变量对象
    var private = {
        // 播放器初始化参数
        initOpts: {},
        // ckplayer播放器及插件的swf路径
        swf: {
            ckplayer: '/ckplayer6.8/ckplayer/ckplayer.swf'
        }
    };

    // 将CKP指向window.CKP构造函数
    var CKP = window.CKP;

    // 将CKPrototype指向CKP的原型链（用于存放播放器的方法和事件）
    var CKPrototype = CKP.prototype;

    CKPrototype.loadedHandler = loadedHandler;
    /**
     * 播放器加载完成回调函数
     * 注：必须先于loaded声明
     */
    function loadedHandler() {
        // 绑定播放器监听事件
        // http://www.ckplayer.com/manual/9/50.htm
        var bindHandler = function (pid, event, fn) {
            CKobject.getObjectById(pid).addListener(event, fn);
        };

        var playerId = that.player.playerId;

        logger('开始监听事件绑定');

        // 监听事件函数前缀
        var ePrefix = 'CKP.prototype.';

        // 播放
        bindHandler(playerId, 'play', ePrefix + 'playHandler');

        // 暂停
        bindHandler(playerId, 'pause', ePrefix + 'pauseHandler');

        // 是否暂停
        bindHandler(playerId, 'paused', ePrefix + 'pausedHandler');

        // 播放结束
        bindHandler(playerId, 'ended', ePrefix + 'endedHandler');

        // 缓冲百分比
        bindHandler(playerId, 'buffer', ePrefix + 'bufferHandler');

        // 播放时间
        bindHandler(playerId, 'time', ePrefix + 'timeHandler');

        // 总时间
        bindHandler(playerId, 'totaltime', ePrefix + 'totaltimeHandler');

        // 已加载字节
        bindHandler(playerId, 'bytes', ePrefix + 'bytesHandler');

        // 总字节
        bindHandler(playerId, 'totalbytes', ePrefix + 'totalbytesHandler');

        // 单位时间内加载的字节（默认250ms）
        bindHandler(playerId, 'speed', ePrefix + 'speedHandler');

        // 是否静音
        bindHandler(playerId, 'muted', ePrefix + 'mutedHandler');

        // 音量改变
        bindHandler(playerId, 'volumechange', ePrefix + 'volumechangeHandler');

        // 视频加载失败
        bindHandler(playerId, 'error', ePrefix + 'errorHandler');

        // 开始创建新视频
        bindHandler(playerId, 'newVideo', ePrefix + 'newVideoHandler');

        // 开始分析视频
        bindHandler(playerId, 'videoLoad', ePrefix + 'videoLoadHandler');

        // 接受到视频流
        bindHandler(playerId, 'sendNetStream', ePrefix + 'sendNetStreamHandler');

        // 分析出视频的元数据信息
        bindHandler(playerId, 'loadedmetadata', ePrefix + 'loadedmetadataHandler');

        // 视频加载完成
        bindHandler(playerId, 'loadComplete', ePrefix + 'loadCompleteHandler');

        // 视频跳转时间
        bindHandler(playerId, 'seeking', ePrefix + 'seekingHandler');

        // 鼠标在进度栏上移动
        bindHandler(playerId, 'progressBarOver', ePrefix + 'progressBarOverHandler');

        // 鼠标在进度栏上点击
        bindHandler(playerId, 'progressBarDown', ePrefix + 'progressBarDownHandler');

        /**
         * 前置广告监听事件
         */

        // 前置广告开始加载
        bindHandler(playerId, 'frontAdStart', ePrefix + 'frontAdStartHandler');

        // 前置广告暂停
        bindHandler(playerId, 'frontAdPause', ePrefix + 'frontAdPauseHandler');

        // 前置广告暂停后继续
        bindHandler(playerId, 'frontAdContinue', ePrefix + 'frontAdContinueHandler');

        // 跳转到下一个前置广告
        bindHandler(playerId, 'frontAdNext', ePrefix + 'frontAdNextHandler');

        // 单击前置广告
        bindHandler(playerId, 'frontAdClick', ePrefix + 'frontAdClickHandler');

        // 单击"跳过广告"
        bindHandler(playerId, 'frontAdSkip', ePrefix + 'frontAdSkipHandler');

        // 前置广告播放结束
        bindHandler(playerId, 'frontAdEnd', ePrefix + 'frontAdEndHandler');

        // 前置广告是否静音
        bindHandler(playerId, 'frontAdMuted', ePrefix + 'frontAdMutedHandler');

        // 前置广告加载失败
        bindHandler(playerId, 'frontAdError', ePrefix + 'frontAdErrorHandler');

        logger('完成监听事件绑定');

        typeof params.onPlayerLoad === 'function' && params.onPlayerLoad(that);

        logger('播放器加载完成');
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // 封装ckplayer监听函数
    /////////////////////////////////////////////////////////////////////////////////////

    CKPrototype.playHandler = playHandler;
    /**
     * 开始播放
     */
    function playHandler() {
        logger('开始播放');
        CKobject.getObjectById(playerId).marqueeClose();
        typeof params.onPlay === 'function' && params.onPlay(that);
    }

    CKPrototype.pauseHandler = pauseHandler;
    /**
     * 暂停播放
     */
    function pauseHandler() {
        logger('暂停播放');
        CKobject.getObjectById(playerId).marqueeLoad(true, '暂停滚动广告');
        typeof params.onPause === 'function' && params.onPause(that);
    }

    CKPrototype.bufferHandler = bufferHandler;
    /**
     * 缓冲百分比（用作加载超时监听）
     * 
     * @param {number} percent 百分比*100
     */
    function bufferHandler(percent) {
        logger('缓冲进度:', percent, '%');
        typeof params.onBuffer === 'function' && params.onBuffer(that);

        // // 当百分比等于undefined且单次缓冲标识为false，开始记录
        // if (percent === undefined && TIMEOUT_LOGGER.flag === false) {
        //     logger('缓冲开始:', percent, '%');
        //     TIMEOUT_LOGGER.flag = true; // 标识缓冲开始
        //     TIMEOUT_LOGGER.startTime = new Date(); // 记录缓冲开始时间
        //     TIMEOUT_LOGGER.timer = setTimeout(function () {
        //         TIMEOUT_LOGGER.timeout = true;
        //     }, TIMEOUT_LOGGER.duration);
        // } else if (percent === 100 && TIMEOUT_LOGGER.flag === true) {
        //     TIMEOUT_LOGGER.endTime = new Date(); // 记录缓冲结束时间
        //     logger('本次缓冲结束:', percent, '%', '耗时', (TIMEOUT_LOGGER.endTime - TIMEOUT_LOGGER.startTime) / 1000, '秒');
        //     // 重置超时记录对象
        //     TIMEOUT_LOGGER.flag = false;
        //     TIMEOUT_LOGGER.startTime = 0;
        //     TIMEOUT_LOGGER.endTime = 0;
        //     TIMEOUT_LOGGER.timeout = false;
        //     clearTimeout(TIMEOUT_LOGGER.timer);
        // }

        // // 判断是否缓冲超时
        // if (TIMEOUT_LOGGER.timeout) {
        //     logger('本次缓冲超时！');
        //     // 重置超时记录对象
        //     TIMEOUT_LOGGER.flag = false;
        //     TIMEOUT_LOGGER.startTime = 0;
        //     TIMEOUT_LOGGER.endTime = 0;
        //     TIMEOUT_LOGGER.timeout = false;
        //     clearTimeout(TIMEOUT_LOGGER.timer);
        // }
    }

    CKPrototype.timeHandler = timeHandler;
    /**
     * 当前播放时间
     * 
     * @param {number} time 秒
     */
    function timeHandler(time) {
        // logger('当前播放时间:', time, '秒');
        typeof params.onTiming === 'function' && params.onTiming(that);
    }

    CKPrototype.totaltimeHandler = totaltimeHandler;
    /**
     * 视频总时间
     * 
     * @param {number} time 秒
     */
    function totaltimeHandler(time) {
        logger('视频总时间:', time, '秒');
    }

    CKPrototype.bytesHandler = bytesHandler;
    /**
     * 已加载字节数
     * 
     * @param {number} bytes 字节
     */
    function bytesHandler(bytes) {
        logger('已加载:', bytes, '字节', bytes / 1024 / 1024, 'MB');
    }

    CKPrototype.totalbytesHandler = totalbytesHandler;
    /**
     * 总字节数
     * 
     * @param {number} bytes 字节
     */
    function totalbytesHandler(bytes) {
        logger('总字节:', bytes, '字节', bytes / 1024 / 1024, 'MB');
    }

    CKPrototype.mutedHandler = mutedHandler;
    /**
     * 是否静音
     * 
     * @param {boolean} muted 是否静音
     */
    function mutedHandler(muted) {
        logger('静音:', muted);
        typeof params.onMuted === 'function' && params.onMuted(that);
    }

    CKPrototype.volumechangeHandler = volumechangeHandler;
    /**
     * 音量改变
     * 
     * @param {number} vol 音量
     */
    function volumechangeHandler(vol) {
        logger('音量:', vol);
        typeof params.onVolumeChange === 'function' && params.onVolumeChange(that);
    }

    CKPrototype.errorHandler = errorHandler;
    /**
     * 视频加载失败
     */
    function errorHandler() {
        logger('视频加载失败');
        typeof params.onError === 'function' && params.onError();
    }

    CKPrototype.newVideoHandler = newVideoHandler;
    /**
     * 新的视频应用开始建立
     */
    function newVideoHandler() {
        logger('开始创建新视频');
        typeof params.onNewVideo === 'function' && params.onNewVideo(that);
    }

    CKPrototype.videoLoadHandler = videoLoadHandler;
    /**
     * 开始分析视频（包括分析视频地址或加载输出视频地址的文本地址，xml地址，json地址，swf文件）
     */
    function videoLoadHandler() {
        logger('开始分析视频');
        typeof params.onVideoLoad === 'function' && params.onVideoLoad(that);
    }

    CKPrototype.sendNetStreamHandler = sendNetStreamHandler;
    /**
     * 接收到视频流
     */
    function sendNetStreamHandler() {
        logger('接收到视频流');
        typeof params.onSendNetStream === 'function' && params.onSendNetStream(that);
    }

    CKPrototype.loadedmetadataHandler = loadedmetadataHandler;
    /**
     * 完成视频元数据信息分析
     * 
     * 分析出视频的元数据信息（这里的元数据指的是单段视频的真实元数据（包括宽，高，[总时间]，[总字节]）或多段视频的计算出的元数据（包括宽，高，[总时间]，[总字节]））
     */
    function loadedmetadataHandler() {
        logger('完成视频元数据信息分析');
        logger(that.player.o.getStatus());
        typeof params.onLoadedMetadata === 'function' && params.onLoadedMetadata(that);
    }

    CKPrototype.loadCompleteHandler = loadCompleteHandler;
    /**
     * 视频加载结束（普通的单段视频是真实的加载完成，支持随意拖动或多段视频时则指表面加载完成）
     */
    function loadCompleteHandler() {
        logger('视频加载完成');
        typeof params.onLoadComplete === 'function' && params.onLoadComplete(that);
    }

    CKPrototype.seekingHandler = seekingHandler;
    /**
     * 视频跳转时间
     * 
     * @param {number} time 秒
     */
    function seekingHandler(time) {
        logger('跳转到:', time, '秒');
        typeof params.onSeeking === 'function' && params.onSeeking(that);
    }

    CKPrototype.progressBarOverHandler = progressBarOverHandler;
    /**
     * 鼠标在进度栏上移动的事件
     * 
     * @param {object} o 鼠标移动对象（包含了当前鼠标指向的时间，相对进度栏的坐标等等）
     */
    function progressBarOverHandler(o) {
        // logger(o);
        typeof params.onProgressBarOver === 'function' && params.onProgressBarOver(that);
    }

    CKPrototype.progressBarDownHandler = progressBarDownHandler;
    /**
     * 鼠标在进度栏上单击的事件
     * 
     * @param {object} o 鼠标移动对象（包含了当前鼠标指向的时间，相对进度栏的坐标等等）
     */
    function progressBarDownHandler(o) {
        // logger(o);
        typeof params.onProgressBarDown === 'function' && params.onProgressBarDown(that);
    }

    CKPrototype.frontAdStartHandler = frontAdStartHandler;
    /**
     * 加载前置广告（如果有多个视频广告，则该监听事件会被触发多次）
     * 
     * @param {string} 
     */
    function frontAdStartHandler(url) {
        logger('前置广告开始加载，地址:', url);
        typeof params.onFrontAdStart === 'function' && params.onFrontAdStart(that);
    }

    CKPrototype.frontAdSkipHandler = frontAdSkipHandler;
    /**
     * "跳过广告"按钮被点击的事件
     */
    function frontAdSkipHandler() {
        logger('跳过前置广告');
        CKobject.getObjectById(playerId).frontAdUnload();
        typeof params.onFrontAdSkip === 'function' && params.onFrontAdSkip(that);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // 自定义监听函数
    /////////////////////////////////////////////////////////////////////////////////////

    function timeoutHandler() {

    }

    CKPrototype.qualityChangeHandler = qualityChangeHandler;
    /**
     * 清晰度切换回调函数
     * 
     * @param  {string}     url     切换后的清晰度对应的url地址
     * @param  {number}     time    切换前的播放时间
     * @param  {number}     volume  切换前音量
     * @return {boolean}            true: 切换后的视频为m3u8直播流（s->1）
     * 
     * 注：该函数是在definition.swf中被调用的
     */
    function qualityChangeHandler(url, time, volume) {
        var m3u8 = false;
        if (private.initOpts.m3u8) {
            m3u8 = true;
        }
        typeof params.onQualityChange === 'function' && params.onQualityChange(that);
        return m3u8;
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // 封装ckplayer控制函数
    /////////////////////////////////////////////////////////////////////////////////////

    that.videoPlay = videoPlay;
    /**
     * 播放视频
     */
    function videoPlay() {
        that.player.o.videoPlay();
    }

    that.videoPause = videoPause;
    /**
     * 暂停播放视频
     */
    function videoPause() {
        that.player.o.videoPause();
    }

    that.playOrPause = playOrPause;
    /**
     * 在播放/暂停视频二个事件中进行切换
     */
    function playOrPause() {
        that.player.o.playOrPause();
    }

    that.videoSeek = videoSeek;
    /**
     * 跳转到指定秒数进行播放
     * 
     * @param {number} 秒数
     */
    function videoSeek(sec) {
        that.player.o.videoSeek(sec);
    }

    that.changeVolume = changeVolume;
    /**
     * 改变音量
     * 
     * @param {number} 音量
     */
    function changeVolume(vol) {
        that.player.o.changeVolume(vol);
    }

    that.getStatus = getStatus;
    /**
     * 获取播放器相关属性
     */
    function getStatus() {
        return that.player.o.getStatus();
    }

    that.frontAdPause = frontAdPause;
    /**
     * 暂停前置广告
     */
    function frontAdPause() {
        that.player.o.frontAdPause(true);
    }

    that.frontAdResume = frontAdResume;
    /**
     * 继续播放前置广告
     */
    function frontAdResume() {
        that.player.o.frontAdPause(false);
    }

    that.frontAdUnload = frontAdUnload;
    /**
     * 跳过前置广告
     */
    function frontAdUnload() {
        that.player.o.frontAdUnload();
    }

    that.changeFace = changeFace;
    /**
     * 是否隐藏控制栏
     * 
     * @param {boolean} hide true为隐藏，false为显示
     */
    function changeFace(hide) {
        if (hide) {
            that.player.o.changeFace(true);
        } else {
            that.player.o.changeFace(false);
        }
    }

    that.videoClear = videoClear;
    /**
     * 清除视频（视频清除后不能再使用newAddress来播放新的视频）
     */
    function videoClear() {
        that.player.o.videoClear();
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // 自定义控制函数
    /////////////////////////////////////////////////////////////////////////////////////

    that.destroy = destroy;
    /**
     * 销毁播放器实例
     */
    function destroy() {
        that.videoClear(); // 清除正在播放的视频
        document.getElementById(that.player.domId).innerHTML = ''; // 彻底清除播放器元素
    }

    that.reload = reload;
    /**
     * 重新加载视频
     */
    function reload() {
        that.videoClear(); // 清除正在播放的视频
        // 自动播放重新加载后的视频
        var opts = $.extend(true, private.initOpts, {
            autoPlay: 1
        });
        init(opts);
    }

    that.getVideoPlayer = getVideoPlayer;
    /**
     * 获取播放器实例
     * 
     * @param {number} playerId 播放器id
     */
    function getVideoPlayer(playerId) {
        return CKobject.getObjectById(playerId);
    }

    that.setVideoWH = setVideoWH;
    /**
     * 设置视频播放器宽度和高度
     * 
     * @param {number} width    播放器宽度
     * @param {number} height   播放器高度
     */
    function setVideoWH(width, height) {
        // 同时获取object和embed元素
        // 因为ie8下，给embed设置宽高不起作用
        // 值得注意的是，ckplayer会为生成的object和embed添加相同的id和name属性
        var o = $('[name="' + that.player.playerId + '"]');
        o.css({
            width: width,
            height: height
        });
    }

    /**
     * 日志输出
     */
    function logger() {
        var console = window.console;
        var args = [];
        // 过滤掉arguments的内置属性，只取实参
        for (var i = 0; i < arguments.length; i += 1) {
            args.push(arguments[i]);
        }
        console && console.log.apply(null, args);
    }

    /**
     * 异常输出
     */
    function error(msg) {
        throw new Error(msg);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    // 初始化播放器函数
    /////////////////////////////////////////////////////////////////////////////////////

    that.init = init;
    /**
     * 初始化视频播放器
     * 
     * @param {object} opts              播放器初始化参数
     * @param {string} opts.url          播放地址url
     * @param {string} opts.live         是否是直播
     * @param {string} opts.m3u8         是否是视频流
     * @param {string} opts.preAdTime    前置广告播放时间
     * @param {number} opts.defTexts     清晰度切换文本
     * @param {string} opts.defFiles     清晰度切换视频url
     * @param {number} opts.autoPlay     是否自动播放
     */
    function init(opts) {
        /**
         * 初始化播放器事件（包括自定义插件的回调函数）
         */
        var ckp = window.ckp = new CKP();
        logger(ckp);

        // 播放器参数，比如视频地址，是否默认播放等
        // http://www.ckplayer.com/manual/17/21.htm
        // http://www.ckplayer.com/manual/17/22.htm
        // var flashvars = {
        //     f: 'http://img.ksbbs.com/asset/Mon_1605/0ec8cc80112a2d6.mp4',
        //     c: 0,
        //     // b: 1,
        //     p: 2,
        //     i: 'http://www.ckplayer.com/static/images/cqdw.jpg',
        //     loaded: 'loadedHandler'
        // };
        var opts = opts || {};
        // 视频播放地址
        var url = opts.url || '';

        /**
         * 视频类型：
         * 1. mp4 ： vType = 0
         * 2. m3u8： vType = 1
         * 
         * 其中，m3u8又分为两种：
         * 1. 直播（按照时间从服务端获取新的m3u列表文件，且有后续的推流）
         * 2. 回播（第一个m3u包含了所有的视频切片，且没有后续的推流）
         * 
         * 注：这里将m3u8视频调用方式设置为文件调用的原因是，接口返回的数据中重新设置了调用方式，格式如下，
         * {a->http://live.hcs.cmvideo.cn/wd_ls/ych/ychc/600/index.m3u8?msisdn=40211515061104861421311119893149&spid=600226&sid=5500035440&pid=2028593040&Channel_ID=0119_04102000-99000-200900260000000&ProgramID=619495400&client_ip=10.0.30.254&assertID=5100031377&partnerid=1001621&AdCodeNum=50&AdFlag=0&VideoType=live&timestamp=20170628090358&encrypt=2103b195240ca76fdd33be48a716f00d}
         * {s->4}
         * 在接口返回的结果中，调用方式s变更为了swf直播流调用，同时参数a变更为了真实的m3u列表文件
         */
        // 是否是视频流
        var m3u8 = opts.m3u8 || false;
        // 是否是直播（控制进度条是否能够拖动）
        var live = m3u8 === false ? 0 : (opts.live ? 1 : 0);
        // 视频地址调用方式，默认为普通调用，vMediaReq的值即是视频资源地址（如*.mp4）
        var vType = 0;
        // 视频资源请求地址，默认无请求地址，直接播放视频资源地址（如*.mp4）
        var vMediaReq = url;
        // 视频资源返回值，默认为空
        var vMediaRes = '';
        // 如果是视频流资源，则将调用方式设置为1
        if (m3u8) {
            // 这里将调用方式设置为1，是由于在请求接口返回值中设置了{s->4}
            // 所以这里还是采用文本形式的调用
            // http://www.ckplayer.com/manual/16/24.htm
            vType = 1;
        }
        // 前置广告播放总时长
        var preAdTime = opts.preAdTime || 0;
        // 前置广告最少观看时长
        var preAdSkipTime = opts.preAdSkipTime || 0;
        // 清晰度文本
        var defTexts = opts.defTexts || '';
        // 清晰度视频url
        var defFiles = opts.defFiles || '';
        /**
         * 是否自动播放
         * 0: 默认暂停
         * 1: 默认播放
         * 2: 默认不加载视频
         */
        var autoPlay = opts.autoPlay || 2;

        // 保存播放器初始化参数（以便在其他事件中访问，如reload等）
        private.initOpts = opts;

        logger(opts);

        var flashvars = {
            // 指定播放器加载何种配置文件来配置播放器的界面，语言，设置
            c: 0,
            // 是否允许和播放器进行交互（0则可以交互，注意：如果不允许交互，那么任何事件监控和方法调用都会失效）
            b: 0,
            // 视频地址调用方式
            s: vType,
            // 配合s使用的，具体值视s值决定
            // 注：文件夹名不能为m3u8（原因未知）
            f: vMediaReq,
            // 配合s,f使用，当s=0时，a值为空，当s>0时，可以使用a值和f值动态组装成新的地址
            a: vMediaRes,
            // 是否是直播形式，如果lv=1，此时播放器的进度条将被锁定。显示时间的文本内容也显示：正在直播
            lv: live,
            // 清晰度切换文本
            deft: defTexts,
            // 清晰度切换
            deff: encodeURIComponent(defFiles), // 需对视频地址进行uri编码后，才能进行播放
            // 视频是否自动播放
            p: autoPlay,
            // 视频直接从该时间点进行播放，可以用于跳过片头或记忆播放功能
            g: 0,
            // 播放器默认暂停或默认不加载视频情况下显示的海报图
            i: 'http://img.kuai8.com/attaches/album/20141225/201412251620104965.jpg',
            // 前置广告
            // l: 'http://videostorage.ad.cmvideo.cn:8080/v1/iflyad/deliverysystem/dsp/video/e885e49aa07dec3cfc2cc925689219c1.mp4',
            // l: 'http://img.qqai.net/uploads/i_1_780458856x2655935137_21.jpg',
            // 前置广告链接地址
            r: 'http://www.baidu.com',
            // 前置广告的播放时间（如果是视频，则可以不用进行设置）
            t: preAdTime,
            // 暂停广告
            d: 'http://i3.shouyou.itc.cn/v3/coc/2015/04/03/04031539031682715.jpg|http://yun.baozoumanhua.com/Project/RageMaker0/images/0/11.png',
            // 暂停广告链接地址
            u: 'http://www.baidu.com',
            // 播放器加载后调用的函数名
            loaded: 'window.ckp.loadedHandler',
            // 视频清晰度切换后的回调函数
            setQuality: 'window.ckp.qualityChangeHandler'
        };

        logger(flashvars);

        // object param参数，比如背景色，是否允许全屏等
        // https://helpx.adobe.com/flash/kb/flash-object-embed-tag-attributes.html
        var objParams = {
            bgcolor: '#FFF',
            allowFullScreen: true,
            allowScriptAccess: 'always',
            wmode: 'transparent'
        };

        // 调用flashplayer，生成flash播放器
        CKobject.embedSWF(
            private.swf.ckplayer,
            that.player.domId,
            that.player.playerId,
            that.player.width,
            that.player.height,
            flashvars,
            objParams
        );

        // 获取播放器实例对象
        that.player.o = getVideoPlayer(that.player.playerId);

        // 将CKPrototype.o指向播放器实例对象
        CKPrototype.o = that.player.o;
    }

    return that;

};