var domId = 'J_Video'; // 视频所在容器的id
var playerId = 'ckplayer_' + domId; // 播放器id
var video = $('#' + domId); // 播放器容器
var videoBarBottom = $('#J_VideoBarBottom'); // 播放器底部工具栏
// 检测flash player安装情况
if (!CKobject.Flash()['f'] || parseInt(CKobject.Flash()['v']) < 11) {
    var info = '<div class="no-flash">\
        您没有安装Flash或者Flash版本较低，\
        <a href="https://get.adobe.com/cn/flashplayer/" target="_blank">\
        请点击此处下载安装最新的Flash插件\
        </a>\
        </div>';
    alert(info);
}

/**
 * mp4
 */
$('#J_PlayMp4').click(function () {

    // 播放器参数初始化
    var opts = {
        url: 'http://218.200.230.11:8080/video/migu_16.mp4',
        preAdTime: 30
    };

    // 创建播放器
    var myVideoPlayer = videoPlayer({
        domId: 'J_Video'
    });

    // 初始化播放器
    myVideoPlayer.init(opts);

    initControlBar(myVideoPlayer);
});

/**
 * m3u8直播
 */
$('#J_PlayLive').click(function () {

    // 获取m3u8直播流
    $.ajax({
        method: 'GET',
        url: '/player/player/queryPlayerAllInfo',
        data: {
            /**
             * 关联视讯: 627514646
             * 5.24迪玛希生日会（能进）
             * GET http://vod.cdn6.cmvideo.cn/crossdomain.xml 200
             * http://vod.cdn6.cmvideo.cn/depository/asset/zhengshi/5101/006/276/5101006276/media/5101006276_5001087112_55.mp4.m3u8?msisdn=40121555156101511415430092930107&spid=600226&sid=5500279516&pid=2028593040&Channel_ID=0119_04102000-99000-200900260000000&ProgramID=627514646&client_ip=10.0.30.254&assertID=5101006276&partnerid=1001621&AdCodeNum=55&AdFlag=0&VideoType=vod&timestamp=20170622150153&encrypt=b680fcdd8ec311a8389abb42f7ed49dc
             */
            // sourceId: 627514646,
            /**
             * 关联视讯: 622777937
             * 咪咕汇明星采访间（不能进）
             * GET http://vod.migu.cn/crossdomain.xml 404 (Not Found)
             * http://vod.migu.cn/KRqkeJOXJCzls1wfy8sKO7LYhR0AbuYG1Aqk1Nk607NiX7/D8W5s1ni98agh5oReYOY89cdqos0YWDsDPCOwupltoZenT6yEYAG+YxQS2oTnSkQv1755Di7y906jDG10Gel79DbGAbQqDI3QbAvfySFgN2AxhkfiqvvONepSmGgzcgdZlMH7qqzAm7XEFAJu/%E4%B8%80%E7%B2%92%E7%B3%96-%E4%BE%A7%E7%94%B0.mp4?msisdn=2a257d4c-1ee0-4ad8-8081-b1650c26390a&spid=600906&sid=36880813173002&timestamp=20170622150547&encrypt=13b33045904fd54150469a567bb48f2c&k=218488e6eb558dc6&t=1498122347679&ec=1&FN=%E4%B8%80%E7%B2%92%E7%B3%96
             */
            // sourceId: 622777937,
            sourceId: 'clientTest',
            currentPlayType: 2,
            via: 'website', // ckplayer专用接口属性
            width: 1440,
            height: 900,
        }
    }).then(function (res) {
        res = JSON.parse(res);

        // 获取并设置清晰度
        var defs = res.data.videoBitrates;
        var defTexts = []; // 清晰度文本
        var defFiles = []; // 清晰度视频url

        if (defs.SD) {
            defTexts.push('标清');
            defFiles.push(defs.SD.url);
        }
        if (defs.HD) {
            defTexts.push('高清');
            defFiles.push(defs.HD.url);
        }
        if (defs.BD) {
            defTexts.push('超清');
            defFiles.push(defs.BD.url);
        }

        // 播放器参数初始化
        var opts = {
            m3u8: true,
            live: true,
            url: defs.SD.url,
            // autoPlay: 1,
            // url: 'http://218.200.230.11:8080/video/migu_16.mp4',
            preAdTime: 30,
            defTexts: defTexts.join(','),
            defFiles: defFiles.join('|')
        };

        // 创建播放器
        var myVideoPlayer = videoPlayer({
            domId: 'J_Video'
        });

        // 初始化播放器
        myVideoPlayer.init(opts);

        initControlBar(myVideoPlayer);
    });

});

/**
 * m3u8回播
 */
$('#J_PlayReplay').click(function () {

    // 获取m3u8直播流
    $.ajax({
        method: 'GET',
        url: '/player/player/queryPlayerAllInfo',
        data: {
            /**
             * 关联视讯: 627514646
             * 5.24迪玛希生日会（能进）
             * GET http://vod.cdn6.cmvideo.cn/crossdomain.xml 200
             * http://vod.cdn6.cmvideo.cn/depository/asset/zhengshi/5101/006/276/5101006276/media/5101006276_5001087112_55.mp4.m3u8?msisdn=40121555156101511415430092930107&spid=600226&sid=5500279516&pid=2028593040&Channel_ID=0119_04102000-99000-200900260000000&ProgramID=627514646&client_ip=10.0.30.254&assertID=5101006276&partnerid=1001621&AdCodeNum=55&AdFlag=0&VideoType=vod&timestamp=20170622150153&encrypt=b680fcdd8ec311a8389abb42f7ed49dc
             */
            sourceId: 627514646,
            /**
             * 关联视讯: 622777937
             * 咪咕汇明星采访间（不能进）
             * GET http://vod.migu.cn/crossdomain.xml 404 (Not Found)
             * http://vod.migu.cn/KRqkeJOXJCzls1wfy8sKO7LYhR0AbuYG1Aqk1Nk607NiX7/D8W5s1ni98agh5oReYOY89cdqos0YWDsDPCOwupltoZenT6yEYAG+YxQS2oTnSkQv1755Di7y906jDG10Gel79DbGAbQqDI3QbAvfySFgN2AxhkfiqvvONepSmGgzcgdZlMH7qqzAm7XEFAJu/%E4%B8%80%E7%B2%92%E7%B3%96-%E4%BE%A7%E7%94%B0.mp4?msisdn=2a257d4c-1ee0-4ad8-8081-b1650c26390a&spid=600906&sid=36880813173002&timestamp=20170622150547&encrypt=13b33045904fd54150469a567bb48f2c&k=218488e6eb558dc6&t=1498122347679&ec=1&FN=%E4%B8%80%E7%B2%92%E7%B3%96
             */
            // sourceId: 622777937,
            // sourceId: 'clientTest',
            currentPlayType: 2,
            via: 'website', // ckplayer专用接口属性
            width: 1440,
            height: 900,
        }
    }).then(function (res) {
        res = JSON.parse(res);

        // 获取并设置清晰度
        var defs = res.data.videoBitrates;
        var defTexts = []; // 清晰度文本
        var defFiles = []; // 清晰度视频url

        if (defs.SD) {
            defTexts.push('标清');
            defFiles.push(defs.SD.url);
        }
        if (defs.HD) {
            defTexts.push('高清');
            defFiles.push(defs.HD.url);
        }
        if (defs.BD) {
            defTexts.push('超清');
            defFiles.push(defs.BD.url);
        }

        // 播放器参数初始化
        var opts = {
            m3u8: true,
            live: false,
            url: defs.SD.url,
            preAdTime: 30,
            defTexts: defTexts.join(','),
            defFiles: defFiles.join('|')
        };

        // 创建播放器
        var myVideoPlayer = videoPlayer({
            domId: 'J_Video'
        });

        // 初始化播放器
        myVideoPlayer.init(opts);

        initControlBar(myVideoPlayer);
    });

});

// 生成播放器控制工具栏
function initControlBar(myVideoPlayer) {
    var screenBtn = $('<button type="button" id="J_ScreenMode">正常/影院模式切换</button>');
    var reloadBtn = $('<button type="button" id="J_Reload">重载视频</button>');
    var destroyBtn = $('<button type="button" id="J_Destroy">清除视频</button>');

    // 控制栏
    var controlOpenBtn = $('<button type="button" id="J_ControlOpen">打开底部控制栏</button>');
    var controlCloseBtn = $('<button type="button" id="J_ControlClose">关闭底部控制栏</button>');

    // 滚动文字广告
    var marqueeOpenBtn = $('<button type="button" id="J_MarqueeOpen">打开滚动文字广告</button>');
    var marqueeCloseBtn = $('<button type="button" id="J_MarqueeClose">关闭滚动文字广告</button>');

    // 贴片广告
    var stickerAdLoadBtn = $('<button type="button" id="J_StickerAdLoad">加载贴片广告</button>');
    var stickerAdCloseBtn = $('<button type="button" id="J_StickerAdClose">关闭贴片广告</button>');

    // 暂停广告
    var pauseAdLoadBtn = $('<button type="button" id="J_PauseAdLoad">加载暂停广告</button>');
    var pauseAdCloseBtn = $('<button type="button" id="J_PauseAdClose">关闭暂停广告</button>');

    // 弹幕
    var barrageInput = $('<input type="text" id="J_BarrageInput" class="video-barrage-input" placeholder="输入弹幕，回车发送" />');
    var barrageClearBtn = $('<button type="button" id="J_BarrageClose">清除弹幕</button>');

    videoBarBottom.html('')
        .append(barrageInput)
        .append(barrageClearBtn)
        .append('<br>')
        .append(screenBtn)
        .append(reloadBtn)
        .append(destroyBtn)
        .append(controlOpenBtn)
        .append(controlCloseBtn)
        .append('<br>')
        .append(marqueeOpenBtn)
        .append(marqueeCloseBtn)
        .append('<br>')
        .append(stickerAdLoadBtn)
        .append(stickerAdCloseBtn)
        .append(pauseAdLoadBtn)
        .append(pauseAdCloseBtn);

    /**
     * 重新加载视频
     */
    reloadBtn.on('click', function () {
        myVideoPlayer.reload();
    });

    /**
     * 清除视频
     */
    destroyBtn.on('click', function () {
        myVideoPlayer.destroy();
        videoBarBottom.html('');
    });

    /**
     * 正常（小屏）/影院模式（宽屏）切换
     */
    screenBtn.on('click', function () {
        // console.log(myVideoPlayer.player.o);
        var playerDom = $(myVideoPlayer.player.o);
        playerDom.toggleClass('theater');
        if (playerDom.hasClass('theater')) {
            myVideoPlayer.setVideoWH(1200, 600);
        } else {
            myVideoPlayer.setVideoWH(600, 400);
        }
    });

    /**
     * 底部控制栏
     */
    controlOpenBtn.on('click', function () {
        myVideoPlayer.changeFace(false);
    });
    controlCloseBtn.on('click', function () {
        myVideoPlayer.changeFace(true);
    });

    /**
     * 滚动文字广告
     */
    marqueeOpenBtn.on('click', function () {
        myVideoPlayer.marqueeLoad('滚动文字广告展示');
    });
    marqueeCloseBtn.on('click', function () {
        myVideoPlayer.marqueeClose();
    });

    /**
     * 贴片广告
     */
    stickerAdLoadBtn.on('click', function () {
        myVideoPlayer.stickerAdLoad('https://www.baidu.com/img/bd_logo1.png', 'http://www.baidu.com');
    });
    stickerAdCloseBtn.on('click', function () {
        myVideoPlayer.stickerAdClose();
    });

    /**
     * 暂停广告
     */
    pauseAdLoadBtn.on('click', function () {
        myVideoPlayer.pauseAdLoad('https://www.baidu.com/img/bd_logo1.png', 'http://www.baidu.com');
    });
    pauseAdCloseBtn.on('click', function () {
        myVideoPlayer.pauseAdClose();
    });

    /**
     * 发送弹幕
     */
    var lastFx;
    barrageInput.on('keyup', function (e) {
        // 点击回车，发送弹幕
        if (e.which == 13) {

            // for (var i = 0; i < 12; i++) {

            var text = $(this).val(); // 弹幕文本
            var fx = randomBarragePosition(); // 弹幕在y轴上的位置
            while (fx === lastFx) {
                fx = randomBarragePosition();
            }
            lastFx = fx;
            // console.log(fx);
            var duration = randomUniform(30, 60); // 弹幕飘过屏幕动画时间

            myVideoPlayer.barrageAdd({
                html: text,
                top: fx,
                duration: 20000,
                fontStyle: {
                    fontSize: 24
                }
            });

            // myVideoPlayer.textBoxShow({
            //     // name: 'textboxname_' + Math.random(), //该文本元件的名称，主要作用是关闭时需要用到
            //     coor: '2,0,0,' + fx, //坐标
            //     text: '{font color="#000" size="20" face="Microsoft YaHei,微软雅黑"}' + text + '{/font}',
            //     bgAlpha: 0, //背景透明度
            //     tween: [
            //         ['x', 0, -2000, duration]
            //     ]
            // });

            // }

        }
    });

    /**
     * 清除弹幕
     */
    barrageClearBtn.on('click', function () {
        myVideoPlayer.barrageClear();
    });
}

/**
 * 利用Box-Muller法生成一个服从标准正态分布的随机数
 * https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
 */
function randomNDWithBM() {
    var u = 1 - Math.random(); // 获取[0, 1)的补集(0, 1]
    var v = 1 - Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * 生成均匀分布随机数
 */
function randomUniform(min, max) {
    // Math.random() ∈ [0, 1)
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 随机生成弹幕位置
 */
function randomBarragePosition() {
    // // 利用标准正态分布，采用10000次模拟下的，偏移到正数区间的x'∈[0, 7.70]，生成一个区间在[0, 160]之间，符合正态分布的随机数（且取正数）
    // var randomND = randomNDWithBM() + 3.85;
    // var fx = 160 - Math.abs(160 / 7.70 * randomND);
    // // 由于标准正态分布x的值计算的到的随机数可能大于150
    // // 最终计算出来的fx可能会小于0，故对fx进行绝对值处理
    // // 虽说此举会产生一定的误差，但是在开发应用中并不需要十分严谨，故忽略掉
    // fx = Math.abs(fx);

    var totalRows = 12; // 弹幕总排数
    var lineHeight = 26; // 行高
    var totalHeight = totalRows * lineHeight; // 弹幕区域总高度

    // 利用均匀分布，生成随机数
    var fx = randomUniform(0, totalHeight);

    /**
     * 防止弹幕行重叠：
     * 设置行高为lineHeight，
     * 则可以将弹幕起点设置为[0, lineHeight, lineHeight*2, ... , lineHeight*totalRows]
     */
    if (fx >= 0 && fx <= lineHeight) {
        fx = 0;
    } else if (fx > lineHeight && fx <= lineHeight * 2) {
        fx = lineHeight;
    } else if (fx > lineHeight * 2 && fx <= lineHeight * 3) {
        fx = lineHeight * 2;
    } else if (fx > lineHeight * 3 && fx <= lineHeight * 4) {
        fx = lineHeight * 3;
    } else if (fx > lineHeight * 4 && fx <= lineHeight * 5) {
        fx = lineHeight * 4;
    } else if (fx > lineHeight * 5 && fx <= lineHeight * 6) {
        fx = lineHeight * 5;
    } else if (fx > lineHeight * 6 && fx <= lineHeight * 7) {
        fx = lineHeight * 6;
    } else if (fx > lineHeight * 7 && fx <= lineHeight * 8) {
        fx = lineHeight * 7;
    } else if (fx > lineHeight * 8 && fx <= lineHeight * 9) {
        fx = lineHeight * 8;
    } else if (fx > lineHeight * 9 && fx <= lineHeight * 10) {
        fx = lineHeight * 9;
    } else if (fx > lineHeight * 10 && fx <= lineHeight * 11) {
        fx = lineHeight * 10;
    } else if (fx > lineHeight * 11 && fx <= lineHeight * 12) {
        fx = lineHeight * 11;
    }

    return fx;
}