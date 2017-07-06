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

"use strict";

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
 * @param {function}    params.onNewVideo           新建视频（对视频的控制从这个阶段开始进行，如videoPlay()，videoPause()等等）
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
 * @param {function}    params.onBarrageSwitcherOn  打开弹幕
 * @param {function}    params.onBarrageSwitcherOff 关闭弹幕
 * 
 * 方法控制函数
 * @param {function}    params.videoPlay            播放视频
 * @param {function}    params.videoPause           暂停播放视频
 * @param {function}    params.videoPlayOrPause          在播放/暂停视频二个事件中进行切换
 * @param {function}    params.videoSeek            跳转到指定秒数进行播放
 * @param {function}    params.changeVolume         改变音量
 * @param {function}    params.videoPlay            播放视频
 * @param {function}    params.getStatus            获取播放器相关属性
 * @param {function}    params.frontAdPause         暂停前置广告
 * @param {function}    params.frontAdResume        继续播放前置广告
 * @param {function}    params.frontAdUnload        跳过前置广告
 * @param {function}    params.changeFace           是否隐藏控制栏
 * @param {function}    params.plugin               控制插件
 * @param {function}    params.plugAttribute        获取插件的相关属性
 * @param {function}    params.videoClear           清除视频
 * @param {function}    params.marqueeLoad          显示滚动文字广告（改变滚动文字广告内容）
 * @param {function}    params.marqueeClose         关闭滚动文字广告
 * @param {function}    params.allowFull            是否允许全屏
 * @param {function}    params.videoError           显示视频加载失败
 * @param {function}    params.errorTextShow        是否显示视频加载失败提示框
 * @param {function}    params.promptShow           显示提示文字
 * @param {function}    params.textBoxShow          在播放器中加载（显示）文本元件
 * @param {function}    params.textBoxClose         关闭文本
 * @param {function}    params.textBoxTween         文本元件进行缓动
 * @param {function}    params.getTextBox           获取文本元件的属性
 * 
 * @param {function}    params.destroy              销毁播放器实例
 * @param {function}    params.reload               重新加载视频
 * @param {function}    params.getVideoPlayer       获取播放器实例
 * @param {function}    params.setVideoWH           设置视频播放器宽度和高度
 * @param {function}    params.stickerAdLoad        添加贴片广告
 * @param {function}    params.stickerAdClose       关闭贴片广告
 * @param {function}    params.pauseAdLoad          添加暂停广告
 * @param {function}    params.pauseAdClose         关闭贴片广告
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
        playerId: 'ckplayer_' + params.domId, // 播放器id
        width: params.width || 600, // 播放器宽度
        height: params.height || 400 // 播放器高度
    };

    // 私有变量对象
    var PRIVATE = {
        // 播放器初始化参数
        initOpts: {},
        // ckplayer播放器及插件的swf路径
        swf: {
            ckplayer: '/ckplayer6.8/ckplayer/ckplayer.swf'
        },
        // 贴片广告
        stickerAd: null,
        // 暂停广告
        pauseAd: null,
        // 弹幕开关状态
        barrageStat: false,
        // 视频是否暂停
        paused: true,
        // 弹幕
        barrage: {
            container: params.domId + '_BarrageWrapper', // 弹幕容器id
            length: 0, // 弹幕总数
            // 弹幕队列
            list: {
                // 1: {  // 弹幕id
                //     dom: , // 弹幕jquery对象
                //     animation: // 弹幕动画函数
                // }
            }
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
        typeof params.onPlay === 'function' && params.onPlay(that);
    }

    CKPrototype.pauseHandler = pauseHandler;
    /**
     * 暂停播放
     */
    function pauseHandler() {
        logger('暂停播放');
        typeof params.onPause === 'function' && params.onPause(that);
    }

    CKPrototype.pausedHandler = pausedHandler;
    /**
     * 是否暂停播放
     * 
     * @param {boolean} paused 是否暂停状态，true=暂停，undefined=播放（不清楚为什么是undefined..fk）
     */
    function pausedHandler(paused) {
        if (paused) {
            PRIVATE.paused = true;
        } else {
            PRIVATE.paused = false;
        }
        barragePauseOrResume();
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
        logger(that.getStatus());
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
        that.frontAdUnload();
        var canSkip = true; // 默认允许跳过前置广告
        if (typeof params.onFrontAdSkip === 'function') {
            canSkip = params.onFrontAdSkip(that) || true;
        }
        if (canSkip) {
            that.frontAdUnload();
        }
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
        if (PRIVATE.initOpts.m3u8) {
            m3u8 = true;
        }
        typeof params.onQualityChange === 'function' && params.onQualityChange(that);
        return m3u8;
    }

    CKPrototype.barrageSwitcherHandler = barrageSwitcherHandler;
    /**
     * 弹幕开关回调函数
     */
    function barrageSwitcherHandler(stat) {
        PRIVATE.barrageStat = stat; // 获取弹幕开关状态
        if (stat) { // 打开弹幕
            typeof params.onbarrageSwitcherOn === 'function' && params.onbarrageSwitcherOn(that);
        } else { // 关闭弹幕
            typeof params.onbarrageSwitcherOff === 'function' && params.onbarrageSwitcherOff(that);
        }
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

    that.videoPlayOrPause = videoPlayOrPause;
    /**
     * 在播放/暂停视频二个事件中进行切换
     */
    function videoPlayOrPause() {
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

    that.plugin = plugin;
    /**
     * 控制插件
     * 
     * @param {string}  插件名称，如foo.swf
     * @param {boolean} 是否显示
     */
    function plugin(name, display) {
        that.player.o.plugin(name, display);
    }

    that.plugAttribute = plugAttribute;
    /**
     * 获取插件的相关属性
     * 
     * @param  {string} 插件名称，如foo.swf
     * @return {object} exist:是否存在该插件,x:x坐标,y:y坐标,width:宽,height:高,show:是否显示
     */
    function plugAttribute(name) {
        return that.player.o.plugAttribute(name);
    }

    that.videoClear = videoClear;
    /**
     * 清除视频（视频清除后不能再使用newAddress来播放新的视频）
     */
    function videoClear() {
        that.player.o.videoClear();
    }

    that.marqueeLoad = marqueeLoad;
    /**
     * 显示滚动文字广告（改变滚动文字广告内容）
     * 
     * @param {string} text 滚动广告文字
     */
    function marqueeLoad(text) {
        that.player.o.marqueeLoad(true, text);
    }

    that.marqueeClose = marqueeClose;
    /**
     * 关闭滚动文字广告
     */
    function marqueeClose() {
        that.player.o.marqueeClose();
    }

    that.allowFull = allowFull;
    /**
     * 是否允许全屏
     * true=允许进行（点击全屏按钮，双击播放器）全屏操作，false=不允许全屏
     * 
     * @param {boolean} allow 是否允许
     */
    function allowFull(allow) {
        that.player.o.allowFull(allow);
    }

    that.videoError = videoError;
    /**
     * 显示视频加载失败
     * 
     * @param {string} message 错误信息
     */
    function videoError(message) {
        that.player.o.videoError(message);
    }

    that.errorTextShow = errorTextShow;
    /**
     * 显示视频加载失败
     * 是否显示视频加载失败提示框，true=显示，false=隐藏
     * 
     * @param {boolean} display 是否显示
     */
    function errorTextShow(display) {
        that.player.o.errorTextShow(display);
    }

    that.promptShow = promptShow;
    /**
     * 显示提示文字
     * 显示提示文字，比如鼠标经过自定义插件对显示一个提示，("显示的文字",相对于播放器左上角的x坐标，相对于播放器左上角的y坐标)
     * 
     * @param {string} text 提示文字
     * @param {number} x    相对于播放器左上角的x坐标
     * @param {number} y    相对于播放器左上角的y坐标
     */
    function promptShow(text, x, y) {
        that.player.o.promptShow(text, x, y);
    }

    that.textBoxShow = textBoxShow;
    /**
     * 在播放器中加载（显示）文本元件
     * 可以用来做弹幕
     * 
     * @param {object} o             文本元件配置对象
     * @param {string} o.name        该文本元件的名称，主要作用是关闭时需要用到（如果没有定义，系统会自动分配一个文件名称）
     * @param {string} o.coor        坐标，四个数字进行定义，可参考：http://www.ckplayer.com/manual/18/30.htm
     * @param {string} o.text        文字
     * @param {string} o.bgColor     背景颜色，如'0x000000'
     * @param {string} o.borderColor 边框颜色，如'0x000000'
     * @param {number} o.radius      圆角弧度
     * @param {number} o.alpha       总体透明度
     * @param {number} o.bgAlpha     背景透明度
     * @param {number} o.xWidth      宽度修正
     * @param {number} o.xHeight     高度修正
     * @param {array}  o.pic         附加图片地址数组，可以增加多个图片，如['temp/temp1.png','temp/temp2.png','temp/temp3.png']
     * @param {array}  o.pwh         图片缩放宽高，和上面图片一一对应，如[[30,30],[20,20],[100,100]]
     * @param {array}  o.pEvent      添加图片的点击事件，二维数组形式，[事件名称[,附加值]]，事件名称分为三种：
     *                               url=打开一个地址，javascript=调用一个js函数如：textbox(obj)，同时传递一个对象，对象里包含该图片的基本数据，close=关闭该文本元件
     * @param {array}  o.pCoor       添加图片的坐标，二维数组形式，四个值控制坐标，这里的坐标是相对于文本内容的，坐标控制可参考：http://www.ckplayer.com/manual/18/30.htm
     * @param {array}  o.pRadius     定义各图片的四个角弧度，如图片的宽高是：30,30，弧度也定义成30，则显示圆形
     * @param {array}  o.tween       初始化缓动效果，即该文本元件加载后就进行缓动，二维数组形式，详细可参考下面的控制函数：textBoxTween()
     */
    function textBoxShow(config) {
        that.player.o.textBoxShow(config);
    }

    that.textBoxClose = textBoxClose;
    /**
     * 关闭文本元件
     * 
     * @param {string} name 要关闭的文本元件名称，如果为空，则关闭所有
     */
    function textBoxClose(name) {
        that.player.o.textBoxClose(name);
    }

    that.textBoxTween = textBoxTween;
    /**
     * 文本元件进行缓动
     * [['y',0,-30,0.3],['x',1,-30,0.3]]，这个二维数组定义了该文本同时进行二个缓动，
     * 一处是y轴进行移动，一个是x轴进行移动，数组里有四个参数，
     * 意思分别是[缓动类型,相对/绝对,移动值,移动时间]，缓动类型分为三种，
     * 分别是x,y,alpha，相对/绝对的区别是：0=相对，则先计算目前的属性值，然后缓动相对于目前的属性值，
     * 比如上面的['y',0,-30,0.3]，是指在y轴上向上移动30个像素，1=绝对，如上面的['x',1,-30,0.3]，
     * 是指在x轴上移动到x坐标为-30的位置，移动值是要移动的距离或透明度值，缓动时间：指完成该缓动经过的时间
     * 
     * @param {string} name  要进行缓动的文本元件名称
     * @param {array}  tween 参与缓动的数组，这是一个二维数组，每组定义一个缓动方式
     */
    function textBoxTween(name, tween) {
        that.player.o.textBoxTween(name, tween);
    }

    that.getTextBox = getTextBox;
    /**
     * 获取文本元件的属性
     * 
     * @param {string} name 文本元件的名称，返回一个对象，包括如下信息：
     * @param {object} {
     *  name: 该文本元件的名称,
     *  x: 该文本元件的x坐标,
     *  y: 该文本元件的y坐标,
     *  alpha: 该文本元件的透明度，范围0-100的整数,
     *  width: 该文本元件的宽度,
     *  height: 该文本元件的高度
     * }                    
     */
    function getTextBox(name) {
        return that.player.o.getTextBox(name);
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
        var opts = $.extend(true, PRIVATE.initOpts, {
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

    that.stickerAdLoad = stickerAdLoad;
    /**
     * 添加贴片广告
     * 
     * @param {string} sticker   贴片广告图片
     * @param {string} url       贴片广告超链接
     * @param {object} position  贴片广告位置
     * @param {object} size      贴片广告图片尺寸
     */
    function stickerAdLoad(sticker, url, position, size) {
        if (PRIVATE.stickerAd) {
            error('贴片广告已经存在，请勿重复添加');
        }

        sticker = $('<div class="sticker-ad-container">\
            <a class="sticker-ad" href="' + url + '" target="_blank">\
                <img src="' + sticker + '" alt="贴片广告" />\
            </a>\
            <i class="flag">广告</i>\
            <i class="close">关闭</i>\
        </div>');
        var stickerImg = sticker.children('.sticker-ad').children('img'); // 广告图片
        var stickerClose = sticker.children('.close'); // 广告关闭按钮
        var stickerFlag = sticker.children('.flag'); // 广告标识
        var stickerImgWidth = 150; // 广告图片宽度
        var stickerImgHeight = 60; // 广告图片高度
        var stickerImgOffset = 40; // 底部控制栏偏移量
        var stickerStyles = position || {
            position: 'absolute',
            left: 10,
            bottom: 15 + stickerImgOffset,
            backgroundColor: '#fff'
        };
        var stickerImgStyles = size || {
            width: stickerImgWidth,
            height: stickerImgHeight
        };
        var stickerCloseStyles = {
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'inline-block',
            padding: '1px 3px',
            cursor: 'pointer',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 'bold'
        };
        var stickerFlagStyles = {
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'inline-block',
            padding: '1px 3px',
            backgroundColor: '#999',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 'lighter'
        };
        // 将贴片广告添加到视频区域，并设置其样式
        sticker.appendTo($('#' + that.player.domId));
        sticker.css(stickerStyles);
        stickerImg.css(stickerImgStyles);
        stickerClose.css(stickerCloseStyles);
        stickerFlag.css(stickerFlagStyles);

        // 保存贴片广告对象
        PRIVATE.stickerAd = sticker;

        // 点击关闭按钮，关闭贴片广告
        stickerClose.one('click', function () {
            stickerAdClose();
        });
    }

    that.stickerAdClose = stickerAdClose;
    /**
     * 关闭贴片广告
     */
    function stickerAdClose() {
        if (PRIVATE.stickerAd) {
            PRIVATE.stickerAd.remove();
            PRIVATE.stickerAd = null;
        }
    }

    that.pauseAdLoad = pauseAdLoad;
    /**
     * 添加暂停广告
     * 
     * @param {string} sticker   暂停广告图片
     * @param {string} url       暂停广告超链接
     * @param {object} position  暂停广告位置
     * @param {object} size      暂停广告图片尺寸
     */
    function pauseAdLoad(sticker, url, position, size) {
        if (PRIVATE.pauseAd) {
            error('暂停广告已经存在，请勿重复添加');
        }

        var pause = $('<div class="pause-ad-container">\
            <a class="pause-ad" href="' + url + '" target="_blank">\
                <img src="' + sticker + '" alt="暂停广告" />\
            </a>\
            <i class="flag">广告</i>\
            <i class="close">关闭</i>\
        </div>');
        var pauseImg = pause.children('.pause-ad').children('img'); // 广告图片
        var pauseClose = pause.children('.close'); // 广告关闭按钮
        var pauseFlag = pause.children('.flag'); // 广告标识
        var pauseImgWidth = 220; // 广告图片宽度
        var pauseImgHeight = 150; // 广告图片高度
        var pauseImgOffset = 40; // 底部控制栏偏移量
        var pauseStyles = position || {
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: -pauseImgWidth / 2,
            marginTop: -(pauseImgHeight + pauseImgOffset) / 2,
            backgroundColor: '#fff'
        };
        var pauseImgStyles = size || {
            width: pauseImgWidth,
            height: pauseImgHeight
        };
        var pauseCloseStyles = {
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'inline-block',
            padding: '1px 3px',
            cursor: 'pointer',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 'bold'
        };
        var pauseFlagStyles = {
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'inline-block',
            padding: '1px 3px',
            backgroundColor: '#999',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 'lighter'
        };
        // 将暂停广告添加到视频区域，并设置其样式
        pause.appendTo($('#' + that.player.domId));
        pause.css(pauseStyles);
        pauseImg.css(pauseImgStyles);
        pauseClose.css(pauseCloseStyles);
        pauseFlag.css(pauseFlagStyles);

        // 保存暂停广告对象
        PRIVATE.pauseAd = pause;

        // 点击关闭按钮，关闭暂停广告
        pauseClose.one('click', function () {
            pauseAdClose();
        });
    }

    that.pauseAdClose = pauseAdClose;
    /**
     * 关闭贴片广告
     */
    function pauseAdClose() {
        if (PRIVATE.pauseAd) {
            PRIVATE.pauseAd.remove();
            PRIVATE.pauseAd = null;
        }
    }

    that.barrageAdd = barrageAdd;
    /**
     * 添加弹幕
     * 
     * @param {object}      config              弹幕配置
     * @param {string}      config.direction    弹幕移动方向
     * @param {number}      config.top          弹幕距播放区域顶部的坐标
     * @param {string}      config.html         弹幕html结构
     * @param {number}      config.duration     弹幕飘过屏幕的时间
     * @param {object}      config.fontStyle    弹幕文字样式  
     * @param {object}      config.imgStyle     弹幕图片样式  
     * @param {function}    complete            弹幕移动完毕后回调函数
     */
    function barrageAdd(config, complete) {
        // 创建弹幕区域
        var playerWrapper = $('#' + that.player.domId); // 播放器区域
        var barrageWrapper = $('#' + PRIVATE.barrage.container); // 弹幕区域
        if ($('#' + PRIVATE.barrage.container).length === 0) {
            barrageWrapper = $('<div id="' + PRIVATE.barrage.container + '" class="video-player-barrage-wrapper"></div>'); // 弹幕区域
            // 给弹幕区域绑定点击事件，用于切换播放/暂停
            barrageWrapper.on('click', function () {
                videoPlayOrPause();
            });
        }
        playerWrapper.append(barrageWrapper); // 添加弹幕区域到播放器区域
        var barrage = $('<div class="video-player-barrage-item"></div>'); // 单条弹幕
        var barrageStyle = {}; // 弹幕样式
        var barrageAnimate = {}; // 弹幕动画
        config.direction = config.direction || 'left'; // 默认从右向左移动
        barrageWrapper.append(barrage); // 添加单条弹幕到弹幕区域
        switch (config.direction) {
            case 'left':
                barrageStyle = {
                    position: 'absolute',
                    top: config.top,
                    left: '100%',
                    whiteSpace: 'nowrap'
                };
                styling();
                barrageAnimate = {
                    left: -barrage.width()
                };
                break;
            case 'right':
                barrageStyle = {
                    position: 'absolute',
                    top: config.top,
                    right: '100%',
                    whiteSpace: 'nowrap'
                };
                styling();
                barrageAnimate = {
                    right: -barrage.width()
                };
                break;
            default:
                break;
        }
        // 弹幕样式设置
        // 在获取barrage.width()前将弹幕样式设置好，才能获取到真实的width
        function styling() {
            barrageStyle = $.extend(barrageStyle, config.fontStyle);
            barrage.html(config.html).css(barrageStyle);
        }
        /**
         * 弹幕动画函数
         * 
         * @param {number} id       弹幕id
         * @param {number} duration 弹幕动画持续时间（毫秒）
         */
        function animation(id, duration) {
            if (!barrage.is(':animated')) {
                barrage.animate(barrageAnimate, {
                    duration: duration,
                    easing: 'linear',
                    complete: function () {
                        typeof complete === 'function' && complete();
                        barrage.remove();
                        // 动画结束后，同步删除PRIVATE.barrage.list中的元素
                        delete PRIVATE.barrage.list[id];
                        // 再同步减去弹幕数量
                        PRIVATE.barrage.length -= 1;
                    }
                });
            }
        }
        // 存储弹幕动画，用于暂停/恢复弹幕动画
        PRIVATE.barrage.length += 1;
        PRIVATE.barrage.list[PRIVATE.barrage.length] = {
            dom: barrage, // 弹幕jquery对象
            animation: animation, // 动画函数
            duration: config.duration, // 动画持续时间
            startTime: new Date() // 记录动画开始时间
        };
        animation(PRIVATE.barrage.length, config.duration); // 播放弹幕动画
    }

    that.barrageClear = barrageClear;
    /**
     * 清除弹幕
     */
    function barrageClear() {
        if ($('#' + PRIVATE.barrage.container).length) {
            $('#' + PRIVATE.barrage.container).empty();
            PRIVATE.barrage.length = 0;
            PRIVATE.barrage.list = {};
        }
    }

    that.barragePauseOrResume = barragePauseOrResume;
    /**
     * 控制弹幕动画暂停/恢复
     */
    function barragePauseOrResume() {
        for (var key in PRIVATE.barrage.list) {
            // 如果当前是暂停播放，则暂停弹幕动画
            if (PRIVATE.paused === true) {
                PRIVATE.barrage.list[key].dom.stop();
                // 经过的动画时间
                var passedTime = new Date() - PRIVATE.barrage.list[key].startTime;
                // 剩下的动画时间
                var leftDuration = PRIVATE.barrage.list[key].duration - passedTime;
                PRIVATE.barrage.list[key].duration = leftDuration;
            }
            // 如果当前是正在播放，则恢复弹幕动画
            else if (PRIVATE.paused === false) {
                // 更新动画开始时间为恢复弹幕动画的实时时间
                PRIVATE.barrage.list[key].startTime = new Date();
                PRIVATE.barrage.list[key].animation(key, PRIVATE.barrage.list[key].duration);
            }
        }
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
        opts = opts || {};
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
        PRIVATE.initOpts = opts;

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
            PRIVATE.swf.ckplayer,
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