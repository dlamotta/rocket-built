(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var WebApp = Package.webapp.WebApp;
var main = Package.webapp.main;
var WebAppInternals = Package.webapp.WebAppInternals;
var Autoupdate = Package.autoupdate.Autoupdate;
var ECMAScript = Package.ecmascript.ECMAScript;
var RocketChat = Package['rocketchat:lib'].RocketChat;
var Logger = Package['rocketchat:logger'].Logger;
var UserPresence = Package['konecty:user-presence'].UserPresence;
var UserPresenceMonitor = Package['konecty:user-presence'].UserPresenceMonitor;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var check = Package.check.check;
var Match = Package.check.Match;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
var babelHelpers = Package['babel-runtime'].babelHelpers;
var Symbol = Package['ecmascript-runtime'].Symbol;
var Map = Package['ecmascript-runtime'].Map;
var Set = Package['ecmascript-runtime'].Set;
var Promise = Package.promise.Promise;
var TAPi18next = Package['tap:i18n'].TAPi18next;
var TAPi18n = Package['tap:i18n'].TAPi18n;

/* Package-scope variables */
var WebApp;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/livechat.js                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* globals WebApp:true */                                                                                              //
                                                                                                                       //
WebApp = Package.webapp.WebApp;                                                                                        // 3
var Autoupdate = Package.autoupdate.Autoupdate;                                                                        // 4
                                                                                                                       //
WebApp.connectHandlers.use('/livechat/', function (req, res /*, next*/) {                                              // 6
	res.setHeader('content-type', 'text/html; charset=utf-8');                                                            // 7
                                                                                                                       //
	var head = Assets.getText('public/head.html');                                                                        // 9
                                                                                                                       //
	var html = '<html>\n\t\t<head>\n\t\t\t<link rel="stylesheet" type="text/css" class="__meteor-css__" href="/packages/rocketchat_livechat/public/livechat.css?_dc=' + Autoupdate.autoupdateVersion + '">\n\t\t\t<script type="text/javascript">\n\t\t\t\t__meteor_runtime_config__ = ' + JSON.stringify(__meteor_runtime_config__) + ';\n\t\t\t</script>\n\t\t\t<script type="text/javascript" src="/packages/rocketchat_livechat/public/livechat.js?_dc=' + Autoupdate.autoupdateVersion + '"></script>\n\n\t\t\t' + head + '\n\t\t</head>\n\t\t<body>\n\t\t</body>\n\t</html>';
                                                                                                                       //
	res.write(html);                                                                                                      // 25
	res.end();                                                                                                            // 26
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/startup.js                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.startup(function () {                                                                                           // 1
	RocketChat.roomTypes.setPublish('l', function (code) {                                                                // 2
		return RocketChat.models.Rooms.findLivechatByCode(code, {                                                            // 3
			name: 1,                                                                                                            // 4
			t: 1,                                                                                                               // 5
			cl: 1,                                                                                                              // 6
			u: 1,                                                                                                               // 7
			label: 1,                                                                                                           // 8
			usernames: 1,                                                                                                       // 9
			v: 1,                                                                                                               // 10
			livechatData: 1,                                                                                                    // 11
			topic: 1,                                                                                                           // 12
			tags: 1,                                                                                                            // 13
			sms: 1,                                                                                                             // 14
			code: 1,                                                                                                            // 15
			open: 1                                                                                                             // 16
		});                                                                                                                  //
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.authz.addRoomAccessValidator(function (room, user) {                                                       // 20
		return room.t === 'l' && RocketChat.authz.hasPermission(user._id, 'view-livechat-rooms');                            // 21
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.callbacks.add('beforeLeaveRoom', function (user, room) {                                                   // 24
		if (room.t !== 'l') {                                                                                                // 25
			return user;                                                                                                        // 26
		}                                                                                                                    //
		throw new Meteor.Error(TAPi18n.__('You_cant_leave_a_livechat_room_Please_use_the_close_button', {                    // 28
			lng: user.language || RocketChat.settings.get('language') || 'en'                                                   // 29
		}));                                                                                                                 //
	}, RocketChat.callbacks.priority.LOW);                                                                                //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/permissions.js                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.startup(function () {                                                                                           // 1
	var roles = _.pluck(RocketChat.models.Roles.find().fetch(), 'name');                                                  // 2
	if (roles.indexOf('livechat-agent') === -1) {                                                                         // 3
		RocketChat.models.Roles.createOrUpdate('livechat-agent');                                                            // 4
	}                                                                                                                     //
	if (roles.indexOf('livechat-manager') === -1) {                                                                       // 6
		RocketChat.models.Roles.createOrUpdate('livechat-manager');                                                          // 7
	}                                                                                                                     //
	if (roles.indexOf('livechat-guest') === -1) {                                                                         // 9
		RocketChat.models.Roles.createOrUpdate('livechat-guest');                                                            // 10
	}                                                                                                                     //
	if (RocketChat.models && RocketChat.models.Permissions) {                                                             // 12
		RocketChat.models.Permissions.createOrUpdate('view-l-room', ['livechat-agent', 'livechat-manager', 'admin']);        // 13
		RocketChat.models.Permissions.createOrUpdate('view-livechat-manager', ['livechat-manager', 'admin']);                // 14
		RocketChat.models.Permissions.createOrUpdate('view-livechat-rooms', ['livechat-manager', 'admin']);                  // 15
		RocketChat.models.Permissions.createOrUpdate('close-livechat-room', ['livechat-agent', 'livechat-manager', 'admin']);
		RocketChat.models.Permissions.createOrUpdate('close-others-livechat-room', ['livechat-manager', 'admin']);           // 17
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/config.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.startup(function () {                                                                                           // 1
	RocketChat.settings.addGroup('Livechat');                                                                             // 2
                                                                                                                       //
	RocketChat.settings.add('Livechat_enabled', false, { type: 'boolean', group: 'Livechat', 'public': true });           // 4
                                                                                                                       //
	RocketChat.settings.add('Livechat_title', 'Rocket.Chat', { type: 'string', group: 'Livechat', 'public': true });      // 6
	RocketChat.settings.add('Livechat_title_color', '#C1272D', { type: 'color', group: 'Livechat', 'public': true });     // 7
                                                                                                                       //
	RocketChat.settings.add('Livechat_display_offline_form', true, {                                                      // 9
		type: 'boolean',                                                                                                     // 10
		group: 'Livechat',                                                                                                   // 11
		'public': true,                                                                                                      // 12
		section: 'Offline',                                                                                                  // 13
		i18nLabel: 'Display_offline_form'                                                                                    // 14
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_offline_form_unavailable', '', {                                                    // 17
		type: 'string',                                                                                                      // 18
		group: 'Livechat',                                                                                                   // 19
		'public': true,                                                                                                      // 20
		section: 'Offline',                                                                                                  // 21
		i18nLabel: 'Offline_form_unavailable_message'                                                                        // 22
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_offline_title', 'Leave a message', {                                                // 25
		type: 'string',                                                                                                      // 26
		group: 'Livechat',                                                                                                   // 27
		'public': true,                                                                                                      // 28
		section: 'Offline',                                                                                                  // 29
		i18nLabel: 'Title'                                                                                                   // 30
	});                                                                                                                   //
	RocketChat.settings.add('Livechat_offline_title_color', '#666666', {                                                  // 32
		type: 'color',                                                                                                       // 33
		group: 'Livechat',                                                                                                   // 34
		'public': true,                                                                                                      // 35
		section: 'Offline',                                                                                                  // 36
		i18nLabel: 'Color'                                                                                                   // 37
	});                                                                                                                   //
	RocketChat.settings.add('Livechat_offline_message', 'We are not online right now. Please leave us a message:', {      // 39
		type: 'string',                                                                                                      // 40
		group: 'Livechat',                                                                                                   // 41
		'public': true,                                                                                                      // 42
		section: 'Offline',                                                                                                  // 43
		i18nLabel: 'Instructions',                                                                                           // 44
		i18nDescription: 'Instructions_to_your_visitor_fill_the_form_to_send_a_message'                                      // 45
	});                                                                                                                   //
	RocketChat.settings.add('Livechat_offline_email', '', {                                                               // 47
		type: 'string',                                                                                                      // 48
		group: 'Livechat',                                                                                                   // 49
		i18nLabel: 'Email_address_to_send_offline_messages',                                                                 // 50
		section: 'Offline'                                                                                                   // 51
	});                                                                                                                   //
	RocketChat.settings.add('Livechat_offline_success_message', '', {                                                     // 53
		type: 'string',                                                                                                      // 54
		group: 'Livechat',                                                                                                   // 55
		'public': true,                                                                                                      // 56
		section: 'Offline',                                                                                                  // 57
		i18nLabel: 'Offline_success_message'                                                                                 // 58
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_registration_form', true, { type: 'boolean', group: 'Livechat', 'public': true, i18nLabel: 'Show_preregistration_form' });
	RocketChat.settings.add('Livechat_guest_count', 1, { type: 'int', group: 'Livechat' });                               // 62
                                                                                                                       //
	RocketChat.settings.add('Livechat_Room_Count', 1, {                                                                   // 64
		type: 'int',                                                                                                         // 65
		group: 'Livechat',                                                                                                   // 66
		i18nLabel: 'Livechat_room_count'                                                                                     // 67
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_forward_open_chats', false, {                                                       // 70
		type: 'boolean',                                                                                                     // 71
		group: 'Livechat'                                                                                                    // 72
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_forward_open_chats_timeout', 60, {                                                  // 75
		type: 'int',                                                                                                         // 76
		group: 'Livechat',                                                                                                   // 77
		enableQuery: { _id: 'Livechat_forward_open_chats', value: true }                                                     // 78
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_webhookUrl', false, {                                                               // 81
		type: 'string',                                                                                                      // 82
		group: 'Livechat',                                                                                                   // 83
		section: 'CRM Integration',                                                                                          // 84
		i18nLabel: 'Webhook_URL'                                                                                             // 85
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_secret_token', false, {                                                             // 88
		type: 'string',                                                                                                      // 89
		group: 'Livechat',                                                                                                   // 90
		section: 'CRM Integration',                                                                                          // 91
		i18nLabel: 'Secret_token'                                                                                            // 92
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_webhook_on_close', false, {                                                         // 95
		type: 'boolean',                                                                                                     // 96
		group: 'Livechat',                                                                                                   // 97
		section: 'CRM Integration',                                                                                          // 98
		i18nLabel: 'Send_request_on_chat_close'                                                                              // 99
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_webhook_on_offline_msg', false, {                                                   // 102
		type: 'boolean',                                                                                                     // 103
		group: 'Livechat',                                                                                                   // 104
		section: 'CRM Integration',                                                                                          // 105
		i18nLabel: 'Send_request_on_offline_messages'                                                                        // 106
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_Knowledge_Enabled', false, {                                                        // 109
		type: 'boolean',                                                                                                     // 110
		group: 'Livechat',                                                                                                   // 111
		section: 'Knowledge Base',                                                                                           // 112
		'public': true,                                                                                                      // 113
		i18nLabel: 'Enabled'                                                                                                 // 114
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_Knowledge_Apiai_Key', '', {                                                         // 117
		type: 'string',                                                                                                      // 118
		group: 'Livechat',                                                                                                   // 119
		section: 'Knowledge Base',                                                                                           // 120
		'public': true,                                                                                                      // 121
		i18nLabel: 'Apiai_Key'                                                                                               // 122
	});                                                                                                                   //
                                                                                                                       //
	RocketChat.settings.add('Livechat_Knowledge_Apiai_Language', 'en', {                                                  // 125
		type: 'string',                                                                                                      // 126
		group: 'Livechat',                                                                                                   // 127
		section: 'Knowledge Base',                                                                                           // 128
		'public': true,                                                                                                      // 129
		i18nLabel: 'Apiai_Language'                                                                                          // 130
	});                                                                                                                   //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/lib/ua-parser.js                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    //
 * UAParser.js v0.7.10                                                                                                 //
 * Lightweight JavaScript-based User-Agent string parser                                                               //
 * https://github.com/faisalman/ua-parser-js                                                                           //
 *                                                                                                                     //
 * Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>                                                             //
 * Dual licensed under GPLv2 & MIT                                                                                     //
 */(function (e, t) {                                                                                                  //
  "use strict";var n = "0.7.10",                                                                                       // 8
      r = "",                                                                                                          //
      i = "?",                                                                                                         //
      s = "function",                                                                                                  //
      o = "undefined",                                                                                                 //
      u = "object",                                                                                                    //
      a = "string",                                                                                                    //
      f = "major",                                                                                                     //
      l = "model",                                                                                                     //
      c = "name",                                                                                                      //
      h = "type",                                                                                                      //
      p = "vendor",                                                                                                    //
      d = "version",                                                                                                   //
      v = "architecture",                                                                                              //
      m = "console",                                                                                                   //
      g = "mobile",                                                                                                    //
      y = "tablet",                                                                                                    //
      b = "smarttv",                                                                                                   //
      w = "wearable",                                                                                                  //
      E = "embedded",                                                                                                  //
      S = { extend: function (e, t) {                                                                                  //
      for (var n in babelHelpers.sanitizeForInObject(t)) "browser cpu device engine os".indexOf(n) !== -1 && t[n].length % 2 === 0 && (e[n] = t[n].concat(e[n]));return e;
    }, has: function (e, t) {                                                                                          //
      return typeof e == "string" ? t.toLowerCase().indexOf(e.toLowerCase()) !== -1 : !1;                              // 8
    }, lowerize: function (e) {                                                                                        //
      return e.toLowerCase();                                                                                          // 8
    }, major: function (e) {                                                                                           //
      return typeof e === a ? e.split(".")[0] : t;                                                                     // 8
    } },                                                                                                               //
      x = { rgx: function () {                                                                                         //
      var e,                                                                                                           // 8
          n = 0,                                                                                                       //
          r,                                                                                                           //
          i,                                                                                                           //
          a,                                                                                                           //
          f,                                                                                                           //
          l,                                                                                                           //
          c,                                                                                                           //
          h = arguments;while (n < h.length && !l) {                                                                   //
        var p = h[n],                                                                                                  // 8
            d = h[n + 1];if (typeof e === o) {                                                                         //
          e = {};for (a in babelHelpers.sanitizeForInObject(d)) d.hasOwnProperty(a) && (f = d[a], typeof f === u ? e[f[0]] = t : e[f] = t);
        }r = i = 0;while (r < p.length && !l) {                                                                        //
          l = p[r++].exec(this.getUA());if (!!l) for (a = 0; a < d.length; a++) c = l[++i], f = d[a], typeof f === u && f.length > 0 ? f.length == 2 ? typeof f[1] == s ? e[f[0]] = f[1].call(this, c) : e[f[0]] = f[1] : f.length == 3 ? typeof f[1] === s && (!f[1].exec || !f[1].test) ? e[f[0]] = c ? f[1].call(this, c, f[2]) : t : e[f[0]] = c ? c.replace(f[1], f[2]) : t : f.length == 4 && (e[f[0]] = c ? f[3].call(this, c.replace(f[1], f[2])) : t) : e[f] = c ? c : t;
        }n += 2;                                                                                                       //
      }return e;                                                                                                       //
    }, str: function (e, n) {                                                                                          //
      for (var r in babelHelpers.sanitizeForInObject(n)) if (typeof n[r] === u && n[r].length > 0) {                   // 8
        for (var s = 0; s < n[r].length; s++) if (S.has(n[r][s], e)) return r === i ? t : r;                           // 8
      } else if (S.has(n[r], e)) return r === i ? t : r;return e;                                                      //
    } },                                                                                                               //
      T = { browser: { oldsafari: { version: { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" } } }, device: { amazon: { model: { "Fire Phone": ["SD", "KF"] } }, sprint: { model: { "Evo Shift 4G": "7373KT" }, vendor: { HTC: "APA", Sprint: "Sprint" } } }, os: { windows: { version: { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" } } } },
      N = { browser: [[/(opera\smini)\/([\w\.-]+)/i, /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i, /(opera).+version\/([\w\.]+)/i, /(opera)[\/\s]+([\w\.]+)/i], [c, d], [/\s(opr)\/([\w\.]+)/i], [[c, "Opera"], d], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i, /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i, /(?:ms|\()(ie)\s([\w\.]+)/i, /(rekonq)\/([\w\.]+)*/i, /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i], [c, d], [/(trident).+rv[:\s]([\w\.]+).+like\sgecko/i], [[c, "IE"], d], [/(edge)\/((\d+)?[\w\.]+)/i], [c, d], [/(yabrowser)\/([\w\.]+)/i], [[c, "Yandex"], d], [/(comodo_dragon)\/([\w\.]+)/i], [[c, /_/g, " "], d], [/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i, /(qqbrowser)[\/\s]?([\w\.]+)/i], [c, d], [/(uc\s?browser)[\/\s]?([\w\.]+)/i, /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i, /JUC.+(ucweb)[\/\s]?([\w\.]+)/i], [[c, "UCBrowser"], d], [/(dolfin)\/([\w\.]+)/i], [[c, "Dolphin"], d], [/((?:android.+)crmo|crios)\/([\w\.]+)/i], [[c, "Chrome"], d], [/XiaoMi\/MiuiBrowser\/([\w\.]+)/i], [d, [c, "MIUI Browser"]], [/android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i], [d, [c, "Android Browser"]], [/FBAV\/([\w\.]+);/i], [d, [c, "Facebook"]], [/fxios\/([\w\.-]+)/i], [d, [c, "Firefox"]], [/version\/([\w\.]+).+?mobile\/\w+\s(safari)/i], [d, [c, "Mobile Safari"]], [/version\/([\w\.]+).+?(mobile\s?safari|safari)/i], [d, c], [/webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i], [c, [d, x.str, T.browser.oldsafari.version]], [/(konqueror)\/([\w\.]+)/i, /(webkit|khtml)\/([\w\.]+)/i], [c, d], [/(navigator|netscape)\/([\w\.-]+)/i], [[c, "Netscape"], d], [/(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i, /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i, /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i, /(links)\s\(([\w\.]+)/i, /(gobrowser)\/?([\w\.]+)*/i, /(ice\s?browser)\/v?([\w\._]+)/i, /(mosaic)[\/\s]([\w\.]+)/i], [c, d]], cpu: [[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i], [[v, "amd64"]], [/(ia32(?=;))/i], [[v, S.lowerize]], [/((?:i[346]|x)86)[;\)]/i], [[v, "ia32"]], [/windows\s(ce|mobile);\sppc;/i], [[v, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i], [[v, /ower/, "", S.lowerize]], [/(sun4\w)[;\)]/i], [[v, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i], [[v, S.lowerize]]], device: [[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i], [l, p, [h, y]], [/applecoremedia\/[\w\.]+ \((ipad)/], [l, [p, "Apple"], [h, y]], [/(apple\s{0,1}tv)/i], [[l, "Apple TV"], [p, "Apple"]], [/(archos)\s(gamepad2?)/i, /(hp).+(touchpad)/i, /(kindle)\/([\w\.]+)/i, /\s(nook)[\w\s]+build\/(\w+)/i, /(dell)\s(strea[kpr\s\d]*[\dko])/i], [p, l, [h, y]], [/(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i], [l, [p, "Amazon"], [h, y]], [/(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i], [[l, x.str, T.device.amazon.model], [p, "Amazon"], [h, g]], [/\((ip[honed|\s\w*]+);.+(apple)/i], [l, p, [h, g]], [/\((ip[honed|\s\w*]+);/i], [l, [p, "Apple"], [h, g]], [/(blackberry)[\s-]?(\w+)/i, /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i, /(hp)\s([\w\s]+\w)/i, /(asus)-?(\w+)/i], [p, l, [h, g]], [/\(bb10;\s(\w+)/i], [l, [p, "BlackBerry"], [h, g]], [/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i], [l, [p, "Asus"], [h, y]], [/(sony)\s(tablet\s[ps])\sbuild\//i, /(sony)?(?:sgp.+)\sbuild\//i], [[p, "Sony"], [l, "Xperia Tablet"], [h, y]], [/(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i], [[p, "Sony"], [l, "Xperia Phone"], [h, g]], [/\s(ouya)\s/i, /(nintendo)\s([wids3u]+)/i], [p, l, [h, m]], [/android.+;\s(shield)\sbuild/i], [l, [p, "Nvidia"], [h, m]], [/(playstation\s[34portablevi]+)/i], [l, [p, "Sony"], [h, m]], [/(sprint\s(\w+))/i], [[p, x.str, T.device.sprint.vendor], [l, x.str, T.device.sprint.model], [h, g]], [/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i], [p, l, [h, y]], [/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i, /(zte)-(\w+)*/i, /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i], [p, [l, /_/g, " "], [h, g]], [/(nexus\s9)/i], [l, [p, "HTC"], [h, y]], [/[\s\(;](xbox(?:\sone)?)[\s\);]/i], [l, [p, "Microsoft"], [h, m]], [/(kin\.[onetw]{3})/i], [[l, /\./g, " "], [p, "Microsoft"], [h, g]], [/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i, /mot[\s-]?(\w+)*/i, /(XT\d{3,4}) build\//i, /(nexus\s[6])/i], [l, [p, "Motorola"], [h, g]], [/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i], [l, [p, "Motorola"], [h, y]], [/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i, /((SM-T\w+))/i], [[p, "Samsung"], l, [h, y]], [/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i, /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i, /sec-((sgh\w+))/i], [[p, "Samsung"], l, [h, g]], [/(samsung);smarttv/i], [p, l, [h, b]], [/\(dtv[\);].+(aquos)/i], [l, [p, "Sharp"], [h, b]], [/sie-(\w+)*/i], [l, [p, "Siemens"], [h, g]], [/(maemo|nokia).*(n900|lumia\s\d+)/i, /(nokia)[\s_-]?([\w-]+)*/i], [[p, "Nokia"], l, [h, g]], [/android\s3\.[\s\w;-]{10}(a\d{3})/i], [l, [p, "Acer"], [h, y]], [/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i], [[p, "LG"], l, [h, y]], [/(lg) netcast\.tv/i], [p, l, [h, b]], [/(nexus\s[45])/i, /lg[e;\s\/-]+(\w+)*/i], [l, [p, "LG"], [h, g]], [/android.+(ideatab[a-z0-9\-\s]+)/i], [l, [p, "Lenovo"], [h, y]], [/linux;.+((jolla));/i], [p, l, [h, g]], [/((pebble))app\/[\d\.]+\s/i], [p, l, [h, w]], [/android.+;\s(glass)\s\d/i], [l, [p, "Google"], [h, w]], [/android.+(\w+)\s+build\/hm\1/i, /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i, /android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i], [[l, /_/g, " "], [p, "Xiaomi"], [h, g]], [/\s(tablet)[;\/\s]/i, /\s(mobile)[;\/\s]/i], [[h, S.lowerize], p, l]], engine: [[/windows.+\sedge\/([\w\.]+)/i], [d, [c, "EdgeHTML"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i, /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i, /(icab)[\/\s]([23]\.[\d\.]+)/i], [c, d], [/rv\:([\w\.]+).*(gecko)/i], [d, c]], os: [[/microsoft\s(windows)\s(vista|xp)/i], [c, d], [/(windows)\snt\s6\.2;\s(arm)/i, /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i], [c, [d, x.str, T.os.windows.version]], [/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i], [[c, "Windows"], [d, x.str, T.os.windows.version]], [/\((bb)(10);/i], [[c, "BlackBerry"], d], [/(blackberry)\w*\/?([\w\.]+)*/i, /(tizen)[\/\s]([\w\.]+)/i, /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i, /linux;.+(sailfish);/i], [c, d], [/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i], [[c, "Symbian"], d], [/\((series40);/i], [c], [/mozilla.+\(mobile;.+gecko.+firefox/i], [[c, "Firefox OS"], d], [/(nintendo|playstation)\s([wids34portablevu]+)/i, /(mint)[\/\s\(]?(\w+)*/i, /(mageia|vectorlinux)[;\s]/i, /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i, /(hurd|linux)\s?([\w\.]+)*/i, /(gnu)\s?([\w\.]+)*/i], [c, d], [/(cros)\s[\w]+\s([\w\.]+\w)/i], [[c, "Chromium OS"], d], [/(sunos)\s?([\w\.]+\d)*/i], [[c, "Solaris"], d], [/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i], [c, d], [/(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i], [[c, "iOS"], [d, /_/g, "."]], [/(mac\sos\sx)\s?([\w\s\.]+\w)*/i, /(macintosh|mac(?=_powerpc)\s)/i], [[c, "Mac OS"], [d, /_/g, "."]], [/((?:open)?solaris)[\/\s-]?([\w\.]+)*/i, /(haiku)\s(\w+)/i, /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i, /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i, /(unix)\s?([\w\.]+)*/i], [c, d]] },
      C = function (t, n) {                                                                                            //
    if (this instanceof C) {                                                                                           // 8
      var i = t || (e && e.navigator && e.navigator.userAgent ? e.navigator.userAgent : r),                            // 8
          s = n ? S.extend(N, n) : N;return (this.getBrowser = function () {                                           //
        var e = x.rgx.apply(this, s.browser);return (e.major = S.major(e.version), e);                                 // 8
      }, this.getCPU = function () {                                                                                   //
        return x.rgx.apply(this, s.cpu);                                                                               // 8
      }, this.getDevice = function () {                                                                                //
        return x.rgx.apply(this, s.device);                                                                            // 8
      }, this.getEngine = function () {                                                                                //
        return x.rgx.apply(this, s.engine);                                                                            // 8
      }, this.getOS = function () {                                                                                    //
        return x.rgx.apply(this, s.os);                                                                                // 8
      }, this.getResult = function () {                                                                                //
        return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
      }, this.getUA = function () {                                                                                    //
        return i;                                                                                                      // 8
      }, this.setUA = function (e) {                                                                                   //
        return (i = e, this);                                                                                          // 8
      }, this.setUA(i), this);                                                                                         //
    }return new C(t, n).getResult();                                                                                   //
  };C.VERSION = n, C.BROWSER = { NAME: c, MAJOR: f, VERSION: d }, C.CPU = { ARCHITECTURE: v }, C.DEVICE = { MODEL: l, VENDOR: p, TYPE: h, CONSOLE: m, MOBILE: g, SMARTTV: b, TABLET: y, WEARABLE: w, EMBEDDED: E }, C.ENGINE = { NAME: c, VERSION: d }, C.OS = { NAME: c, VERSION: d }, typeof exports !== o ? (typeof module !== o && module.exports && (exports = module.exports = C), exports.UAParser = C) : typeof define === s && define.amd ? define(function () {
    return C;                                                                                                          // 8
  }) : e.UAParser = C;var k = e.jQuery || e.Zepto;if (typeof k !== o) {                                                //
    var L = new C();k.ua = L.getResult(), k.ua.get = function () {                                                     // 8
      return L.getUA();                                                                                                // 8
    }, k.ua.set = function (e) {                                                                                       //
      L.setUA(e);var t = L.getResult();for (var n in babelHelpers.sanitizeForInObject(t)) k.ua[n] = t[n];              // 8
    };                                                                                                                 //
  }                                                                                                                    //
})(typeof window == "object" ? window : this);                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/client/stylesheets/load.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
RocketChat.theme.addPackageAsset(function () {                                                                         // 1
	return Assets.getText('client/stylesheets/livechat.less');                                                            // 2
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/addAgent.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:addAgent': function (username) {                                                                            // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:addAgent' });                        // 4
		}                                                                                                                    //
                                                                                                                       //
		if (!username || !_.isString(username)) {                                                                            // 7
			throw new Meteor.Error('error-invalid-arguments', 'Invalid arguments', { method: 'livechat:addAgent' });            // 8
		}                                                                                                                    //
                                                                                                                       //
		var user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1 } });                              // 11
                                                                                                                       //
		if (!user) {                                                                                                         // 13
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:addAgent' });                      // 14
		}                                                                                                                    //
                                                                                                                       //
		if (RocketChat.authz.addUserRoles(user._id, 'livechat-agent')) {                                                     // 17
			RocketChat.models.Users.setOperator(user._id, true);                                                                // 18
			RocketChat.models.Users.setLivechatStatus(user._id, 'available');                                                   // 19
			return true;                                                                                                        // 20
		}                                                                                                                    //
                                                                                                                       //
		return false;                                                                                                        // 23
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/addManager.js                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:addManager': function (username) {                                                                          // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:addManager' });                      // 4
		}                                                                                                                    //
                                                                                                                       //
		if (!username || !_.isString(username)) {                                                                            // 7
			throw new Meteor.Error('error-invalid-arguments', 'Invalid arguments', { method: 'livechat:addManager' });          // 8
		}                                                                                                                    //
                                                                                                                       //
		var user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1 } });                              // 11
                                                                                                                       //
		if (!user) {                                                                                                         // 13
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:addManager' });                    // 14
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.authz.addUserRoles(user._id, 'livechat-manager');                                                  // 17
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/changeLivechatStatus.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:changeLivechatStatus': function () {                                                                        // 2
		if (!Meteor.userId()) {                                                                                              // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:changeLivechatStatus' });            // 4
		}                                                                                                                    //
                                                                                                                       //
		var user = Meteor.user();                                                                                            // 7
                                                                                                                       //
		var newStatus = user.statusLivechat === 'available' ? 'not-available' : 'available';                                 // 9
                                                                                                                       //
		return RocketChat.models.Users.setLivechatStatus(user._id, newStatus);                                               // 11
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/closeRoom.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:closeRoom': function (roomId, comment) {                                                                    // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'close-livechat-room')) {                   // 3
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeRoom' });                 // 4
		}                                                                                                                    //
                                                                                                                       //
		var room = RocketChat.models.Rooms.findOneById(roomId);                                                              // 7
                                                                                                                       //
		var user = Meteor.user();                                                                                            // 9
                                                                                                                       //
		if (room.usernames.indexOf(user.username) === -1 && !RocketChat.authz.hasPermission(Meteor.userId(), 'close-others-livechat-room')) {
			throw new Meteor.Error('error-not-authorized', 'Not authorized', { method: 'livechat:closeRoom' });                 // 12
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.Livechat.closeRoom({                                                                               // 15
			user: user,                                                                                                         // 16
			room: room,                                                                                                         // 17
			comment: comment                                                                                                    // 18
		});                                                                                                                  //
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/getCustomFields.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:getCustomFields': function () {                                                                             // 2
		return RocketChat.models.LivechatCustomField.find().fetch();                                                         // 3
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/getInitialData.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:getInitialData': function (visitorToken) {                                                                  // 2
		var info = {                                                                                                         // 3
			enabled: null,                                                                                                      // 4
			title: null,                                                                                                        // 5
			color: null,                                                                                                        // 6
			registrationForm: null,                                                                                             // 7
			room: null,                                                                                                         // 8
			triggers: [],                                                                                                       // 9
			departments: [],                                                                                                    // 10
			online: true,                                                                                                       // 11
			offlineColor: null,                                                                                                 // 12
			offlineMessage: null,                                                                                               // 13
			offlineSuccessMessage: null,                                                                                        // 14
			offlineUnavailableMessage: null,                                                                                    // 15
			displayOfflineForm: null                                                                                            // 16
		};                                                                                                                   //
                                                                                                                       //
		var room = RocketChat.models.Rooms.findOpenByVisitorToken(visitorToken, {                                            // 19
			fields: {                                                                                                           // 20
				name: 1,                                                                                                           // 21
				t: 1,                                                                                                              // 22
				cl: 1,                                                                                                             // 23
				u: 1,                                                                                                              // 24
				usernames: 1,                                                                                                      // 25
				v: 1                                                                                                               // 26
			}                                                                                                                   //
		}).fetch();                                                                                                          //
                                                                                                                       //
		if (room && room.length > 0) {                                                                                       // 30
			info.room = room[0];                                                                                                // 31
		}                                                                                                                    //
                                                                                                                       //
		var initSettings = RocketChat.Livechat.getInitSettings();                                                            // 34
                                                                                                                       //
		info.title = initSettings.Livechat_title;                                                                            // 36
		info.color = initSettings.Livechat_title_color;                                                                      // 37
		info.enabled = initSettings.Livechat_enabled;                                                                        // 38
		info.registrationForm = initSettings.Livechat_registration_form;                                                     // 39
		info.offlineTitle = initSettings.Livechat_offline_title;                                                             // 40
		info.offlineColor = initSettings.Livechat_offline_title_color;                                                       // 41
		info.offlineMessage = initSettings.Livechat_offline_message;                                                         // 42
		info.offlineSuccessMessage = initSettings.Livechat_offline_success_message;                                          // 43
		info.offlineUnavailableMessage = initSettings.Livechat_offline_form_unavailable;                                     // 44
		info.displayOfflineForm = initSettings.Livechat_display_offline_form;                                                // 45
		info.language = initSettings.Language;                                                                               // 46
                                                                                                                       //
		RocketChat.models.LivechatTrigger.find().forEach(function (trigger) {                                                // 48
			info.triggers.push(trigger);                                                                                        // 49
		});                                                                                                                  //
                                                                                                                       //
		RocketChat.models.LivechatDepartment.findEnabledWithAgents().forEach(function (department) {                         // 52
			info.departments.push(department);                                                                                  // 53
		});                                                                                                                  //
                                                                                                                       //
		info.online = RocketChat.models.Users.findOnlineAgents().count() > 0;                                                // 56
                                                                                                                       //
		return info;                                                                                                         // 58
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/pageVisited.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:pageVisited': function (token, pageInfo) {                                                                  // 2
		return RocketChat.models.LivechatPageVisited.saveByToken(token, pageInfo);                                           // 3
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/registerGuest.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:registerGuest': function () {                                                                               // 2
		var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];                                  //
                                                                                                                       //
		var token = _ref.token;                                                                                              //
		var name = _ref.name;                                                                                                //
		var email = _ref.email;                                                                                              //
		var department = _ref.department;                                                                                    //
                                                                                                                       //
		var stampedToken = Accounts._generateStampedLoginToken();                                                            // 3
		var hashStampedToken = Accounts._hashStampedToken(stampedToken);                                                     // 4
                                                                                                                       //
		var userId = RocketChat.Livechat.registerGuest.call(this, {                                                          // 6
			token: token,                                                                                                       // 7
			name: name,                                                                                                         // 8
			email: email,                                                                                                       // 9
			department: department,                                                                                             // 10
			loginToken: hashStampedToken                                                                                        // 11
		});                                                                                                                  //
                                                                                                                       //
		// update visited page history to not expire                                                                         //
		RocketChat.models.LivechatPageVisited.keepHistoryForToken(token);                                                    // 15
                                                                                                                       //
		return {                                                                                                             // 17
			userId: userId,                                                                                                     // 18
			token: stampedToken.token                                                                                           // 19
		};                                                                                                                   //
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/removeAgent.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:removeAgent': function (username) {                                                                         // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:removeAgent' });                     // 4
		}                                                                                                                    //
                                                                                                                       //
		if (!username || !_.isString(username)) {                                                                            // 7
			throw new Meteor.Error('error-invalid-arguments', 'Invalid arguments', { method: 'livechat:removeAgent' });         // 8
		}                                                                                                                    //
                                                                                                                       //
		var user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1 } });                              // 11
                                                                                                                       //
		if (!user) {                                                                                                         // 13
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:removeAgent' });                   // 14
		}                                                                                                                    //
                                                                                                                       //
		if (RocketChat.authz.removeUserFromRoles(user._id, 'livechat-agent')) {                                              // 17
			RocketChat.models.Users.setOperator(user._id, false);                                                               // 18
			RocketChat.models.Users.setLivechatStatus(user._id, 'not-available');                                               // 19
			return true;                                                                                                        // 20
		}                                                                                                                    //
                                                                                                                       //
		return false;                                                                                                        // 23
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/removeCustomField.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:removeCustomField': function (_id) {                                                                        // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:removeCustomField' });               // 4
		}                                                                                                                    //
                                                                                                                       //
		check(_id, String);                                                                                                  // 7
                                                                                                                       //
		var customField = RocketChat.models.LivechatCustomField.findOneById(_id, { fields: { _id: 1 } });                    // 9
                                                                                                                       //
		if (!customField) {                                                                                                  // 11
			throw new Meteor.Error('error-invalid-custom-field', 'Custom field not found', { method: 'livechat:removeCustomField' });
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.models.LivechatCustomField.removeById(_id);                                                        // 15
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/removeDepartment.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:removeDepartment': function (_id) {                                                                         // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:removeDepartment' });                // 4
		}                                                                                                                    //
                                                                                                                       //
		check(_id, String);                                                                                                  // 7
                                                                                                                       //
		var department = RocketChat.models.LivechatDepartment.findOneById(_id, { fields: { _id: 1 } });                      // 9
                                                                                                                       //
		if (!department) {                                                                                                   // 11
			throw new Meteor.Error('department-not-found', 'Department not found', { method: 'livechat:removeDepartment' });    // 12
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.models.LivechatDepartment.removeById(_id);                                                         // 15
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/removeManager.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:removeManager': function (username) {                                                                       // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:removeManager' });                   // 4
		}                                                                                                                    //
                                                                                                                       //
		check(username, String);                                                                                             // 7
                                                                                                                       //
		var user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1 } });                              // 9
                                                                                                                       //
		if (!user) {                                                                                                         // 11
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:removeManager' });                 // 12
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.authz.removeUserFromRoles(user._id, 'livechat-manager');                                           // 15
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/removeTrigger.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:removeTrigger': function () /*trigger*/{                                                                    // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:removeTrigger' });                   // 4
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.models.LivechatTrigger.removeAll();                                                                // 7
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/saveCustomField.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* eslint new-cap: [2, {"capIsNewExceptions": ["Match.ObjectIncluding", "Match.Optional"]}] */                         //
                                                                                                                       //
Meteor.methods({                                                                                                       // 3
	'livechat:saveCustomField': function (_id, customFieldData) {                                                         // 4
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 5
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveCustomField' });                 // 6
		}                                                                                                                    //
                                                                                                                       //
		if (_id) {                                                                                                           // 9
			check(_id, String);                                                                                                 // 10
		}                                                                                                                    //
                                                                                                                       //
		check(customFieldData, Match.ObjectIncluding({ field: String, label: String, scope: String, visibility: String }));  // 13
                                                                                                                       //
		if (!/^[0-9a-zA-Z-_]+$/.test(customFieldData.field)) {                                                               // 15
			throw new Meteor.Error('error-invalid-custom-field-nmae', 'Invalid custom field name. Use only letters, numbers, hyphens and underscores.', { method: 'livechat:saveCustomField' });
		}                                                                                                                    //
                                                                                                                       //
		if (_id) {                                                                                                           // 19
			var customField = RocketChat.models.LivechatCustomField.findOneById(_id);                                           // 20
			if (!customField) {                                                                                                 // 21
				throw new Meteor.Error('error-invalid-custom-field', 'Custom Field Not found', { method: 'livechat:saveCustomField' });
			}                                                                                                                   //
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.models.LivechatCustomField.createOrUpdateCustomField(_id, customFieldData.field, customFieldData.label, customFieldData.scope, customFieldData.visibility);
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/saveDepartment.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* eslint new-cap: [2, {"capIsNewExceptions": ["Match.ObjectIncluding", "Match.Optional"]}] */                         //
                                                                                                                       //
Meteor.methods({                                                                                                       // 3
	'livechat:saveDepartment': function (_id, departmentData, departmentAgents) {                                         // 4
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 5
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveDepartment' });                  // 6
		}                                                                                                                    //
                                                                                                                       //
		if (_id) {                                                                                                           // 9
			check(_id, String);                                                                                                 // 10
		}                                                                                                                    //
                                                                                                                       //
		check(departmentData, Match.ObjectIncluding({ enabled: Boolean, name: String, description: Match.Optional(String), agents: Match.Optional([Match.ObjectIncluding({ _id: String, username: String })]) }));
                                                                                                                       //
		if (_id) {                                                                                                           // 15
			var department = RocketChat.models.LivechatDepartment.findOneById(_id);                                             // 16
			if (!department) {                                                                                                  // 17
				throw new Meteor.Error('error-department-not-found', 'Department not found', { method: 'livechat:saveDepartment' });
			}                                                                                                                   //
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.models.LivechatDepartment.createOrUpdateDepartment(_id, departmentData.enabled, departmentData.name, departmentData.description, departmentAgents);
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/saveLivechatInfo.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* eslint new-cap: [2, {"capIsNewExceptions": ["Match.ObjectIncluding", "Match.Optional"]}] */                         //
                                                                                                                       //
Meteor.methods({                                                                                                       // 3
	'livechat:saveLivechatInfo': function (guestData, roomData) {                                                         // 4
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-l-room')) {                           // 5
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveLivechatInfo' });                // 6
		}                                                                                                                    //
                                                                                                                       //
		check(guestData, Match.ObjectIncluding({                                                                             // 9
			_id: String,                                                                                                        // 10
			name: Match.Optional(String),                                                                                       // 11
			email: Match.Optional(String),                                                                                      // 12
			phone: Match.Optional(String)                                                                                       // 13
		}));                                                                                                                 //
                                                                                                                       //
		check(roomData, Match.ObjectIncluding({                                                                              // 16
			_id: String,                                                                                                        // 17
			topic: Match.Optional(String),                                                                                      // 18
			tags: Match.Optional(String)                                                                                        // 19
		}));                                                                                                                 //
                                                                                                                       //
		return RocketChat.Livechat.saveGuest(guestData) && RocketChat.Livechat.saveRoomInfo(roomData, guestData);            // 22
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/saveSurveyFeedback.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* eslint new-cap: [2, {"capIsNewExceptions": ["Match.ObjectIncluding"]}] */                                           //
                                                                                                                       //
Meteor.methods({                                                                                                       // 3
	'livechat:saveSurveyFeedback': function (visitorToken, visitorRoom, formData) {                                       // 4
		check(visitorToken, String);                                                                                         // 5
		check(visitorRoom, String);                                                                                          // 6
		check(formData, [Match.ObjectIncluding({ name: String, value: String })]);                                           // 7
                                                                                                                       //
		var visitor = RocketChat.models.Users.getVisitorByToken(visitorToken);                                               // 9
		var room = RocketChat.models.Rooms.findOneById(visitorRoom);                                                         // 10
                                                                                                                       //
		if (visitor !== undefined && room !== undefined && room.v !== undefined && visitor.profile !== undefined && room.v.token === visitor.profile.token) {
			var updateData = {};                                                                                                // 13
			for (var _iterator = formData, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
				var _ref;                                                                                                          //
                                                                                                                       //
				if (_isArray) {                                                                                                    //
					if (_i >= _iterator.length) break;                                                                                //
					_ref = _iterator[_i++];                                                                                           //
				} else {                                                                                                           //
					_i = _iterator.next();                                                                                            //
					if (_i.done) break;                                                                                               //
					_ref = _i.value;                                                                                                  //
				}                                                                                                                  //
                                                                                                                       //
				var item = _ref;                                                                                                   //
                                                                                                                       //
				if (_.contains(['satisfaction', 'agentKnowledge', 'agentResposiveness', 'agentFriendliness'], item.name) && _.contains(['1', '2', '3', '4', '5'], item.value)) {
					updateData[item.name] = item.value;                                                                               // 16
				} else if (item.name === 'additionalFeedback') {                                                                   //
					updateData[item.name] = item.value;                                                                               // 18
				}                                                                                                                  //
			}                                                                                                                   //
			if (!_.isEmpty(updateData)) {                                                                                       // 21
				return RocketChat.models.Rooms.updateSurveyFeedbackById(room._id, updateData);                                     // 22
			}                                                                                                                   //
		}                                                                                                                    //
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/saveTrigger.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:saveTrigger': function (trigger) {                                                                          // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveTrigger' });                     // 4
		}                                                                                                                    //
                                                                                                                       //
		return RocketChat.models.LivechatTrigger.save(trigger);                                                              // 7
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/searchAgent.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:searchAgent': function (username) {                                                                         // 2
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {                 // 3
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:searchAgent' });                     // 4
		}                                                                                                                    //
                                                                                                                       //
		if (!username || !_.isString(username)) {                                                                            // 7
			throw new Meteor.Error('error-invalid-arguments', 'Invalid arguments', { method: 'livechat:searchAgent' });         // 8
		}                                                                                                                    //
                                                                                                                       //
		var user = RocketChat.models.Users.findOneByUsername(username, { fields: { _id: 1, username: 1 } });                 // 11
                                                                                                                       //
		if (!user) {                                                                                                         // 13
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'livechat:searchAgent' });                   // 14
		}                                                                                                                    //
                                                                                                                       //
		return user;                                                                                                         // 17
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/sendMessageLivechat.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	sendMessageLivechat: function (message) {                                                                             // 2
		var guest;                                                                                                           // 3
                                                                                                                       //
		check(message.rid, String);                                                                                          // 5
		check(message.token, String);                                                                                        // 6
                                                                                                                       //
		guest = Meteor.users.findOne(Meteor.userId(), {                                                                      // 8
			fields: {                                                                                                           // 9
				name: 1,                                                                                                           // 10
				username: 1,                                                                                                       // 11
				department: 1                                                                                                      // 12
			}                                                                                                                   //
		});                                                                                                                  //
                                                                                                                       //
		return RocketChat.Livechat.sendMessage({ guest: guest, message: message });                                          // 16
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/sendOfflineMessage.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* globals DDPRateLimiter */                                                                                           //
Meteor.methods({                                                                                                       // 2
	'livechat:sendOfflineMessage': function (data) {                                                                      // 3
		check(data, {                                                                                                        // 4
			name: String,                                                                                                       // 5
			email: String,                                                                                                      // 6
			message: String                                                                                                     // 7
		});                                                                                                                  //
                                                                                                                       //
		var header = RocketChat.placeholders.replace(RocketChat.settings.get('Email_Header') || '');                         // 10
		var footer = RocketChat.placeholders.replace(RocketChat.settings.get('Email_Footer') || '');                         // 11
                                                                                                                       //
		var message = (data.message + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');                    // 13
                                                                                                                       //
		var html = '\n\t\t\t<h1>New livechat message</h1>\n\t\t\t<p><strong>Visitor name:</strong> ' + data.name + '</p>\n\t\t\t<p><strong>Visitor email:</strong> ' + data.email + '</p>\n\t\t\t<p><strong>Message:</strong><br>' + message + '</p>';
                                                                                                                       //
		var fromEmail = RocketChat.settings.get('From_Email').match(/\b[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}\b/i);      // 21
                                                                                                                       //
		if (fromEmail) {                                                                                                     // 23
			fromEmail = fromEmail[0];                                                                                           // 24
		} else {                                                                                                             //
			fromEmail = RocketChat.settings.get('From_Email');                                                                  // 26
		}                                                                                                                    //
                                                                                                                       //
		Meteor.defer(function () {                                                                                           // 29
			Email.send({                                                                                                        // 30
				to: RocketChat.settings.get('Livechat_offline_email'),                                                             // 31
				from: data.name + ' - ' + data.email + ' <' + fromEmail + '>',                                                     // 32
				replyTo: data.name + ' <' + data.email + '>',                                                                      // 33
				subject: 'Livechat offline message from ' + data.name + ': ' + (data.message + '').substring(0, 20),               // 34
				html: header + html + footer                                                                                       // 35
			});                                                                                                                 //
		});                                                                                                                  //
                                                                                                                       //
		Meteor.defer(function () {                                                                                           // 39
			RocketChat.callbacks.run('sendOfflineLivechatMessage', data);                                                       // 40
		});                                                                                                                  //
                                                                                                                       //
		return true;                                                                                                         // 43
	}                                                                                                                     //
});                                                                                                                    //
                                                                                                                       //
DDPRateLimiter.addRule({                                                                                               // 47
	type: 'method',                                                                                                       // 48
	name: 'livechat:sendOfflineMessage',                                                                                  // 49
	connectionId: function () {                                                                                           // 50
		return true;                                                                                                         // 51
	}                                                                                                                     //
}, 1, 5000);                                                                                                           //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/setCustomField.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({                                                                                                       // 1
	'livechat:setCustomField': function (token, key, value) {                                                             // 2
		var customField = RocketChat.models.LivechatCustomField.findOneById(key);                                            // 3
		if (customField) {                                                                                                   // 4
			if (customField.scope === 'room') {                                                                                 // 5
				return RocketChat.models.Rooms.updateLivechatDataByToken(token, key, value);                                       // 6
			} else {                                                                                                            //
				// Save in user                                                                                                    //
				return RocketChat.models.Users.updateLivechatDataByToken(token, key, value);                                       // 9
			}                                                                                                                   //
		}                                                                                                                    //
                                                                                                                       //
		return true;                                                                                                         // 13
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/methods/webhookTest.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* globals HTTP */                                                                                                     //
var postCatchError = Meteor.wrapAsync(function (url, options, resolve) {                                               // 2
	HTTP.post(url, options, function (err, res) {                                                                         // 3
		if (err) {                                                                                                           // 4
			resolve(null, err.response);                                                                                        // 5
		} else {                                                                                                             //
			resolve(null, res);                                                                                                 // 7
		}                                                                                                                    //
	});                                                                                                                   //
});                                                                                                                    //
                                                                                                                       //
Meteor.methods({                                                                                                       // 12
	'livechat:webhookTest': function () {                                                                                 // 13
		this.unblock();                                                                                                      // 14
                                                                                                                       //
		var sampleData = {                                                                                                   // 16
			type: 'LivechatSession',                                                                                            // 17
			_id: 'fasd6f5a4sd6f8a4sdf',                                                                                         // 18
			label: 'title',                                                                                                     // 19
			topic: 'asiodojf',                                                                                                  // 20
			code: 123123,                                                                                                       // 21
			createdAt: new Date(),                                                                                              // 22
			lastMessageAt: new Date(),                                                                                          // 23
			tags: ['tag1', 'tag2', 'tag3'],                                                                                     // 24
			customFields: {                                                                                                     // 29
				productId: '123456'                                                                                                // 30
			},                                                                                                                  //
			visitor: {                                                                                                          // 32
				_id: '',                                                                                                           // 33
				name: 'visitor name',                                                                                              // 34
				username: 'visitor-username',                                                                                      // 35
				department: 'department',                                                                                          // 36
				email: 'email@address.com',                                                                                        // 37
				phone: '192873192873',                                                                                             // 38
				ip: '123.456.7.89',                                                                                                // 39
				browser: 'Chrome',                                                                                                 // 40
				os: 'Linux',                                                                                                       // 41
				customFields: {                                                                                                    // 42
					customerId: '123456'                                                                                              // 43
				}                                                                                                                  //
			},                                                                                                                  //
			agent: {                                                                                                            // 46
				_id: 'asdf89as6df8',                                                                                               // 47
				username: 'agent.username',                                                                                        // 48
				name: 'Agent Name',                                                                                                // 49
				email: 'agent@email.com'                                                                                           // 50
			},                                                                                                                  //
			messages: [{                                                                                                        // 52
				username: 'visitor-username',                                                                                      // 53
				msg: 'message content',                                                                                            // 54
				ts: new Date()                                                                                                     // 55
			}, {                                                                                                                //
				username: 'agent.username',                                                                                        // 57
				agentId: 'asdf89as6df8',                                                                                           // 58
				msg: 'message content from agent',                                                                                 // 59
				ts: new Date()                                                                                                     // 60
			}]                                                                                                                  //
		};                                                                                                                   //
                                                                                                                       //
		var options = {                                                                                                      // 64
			headers: {                                                                                                          // 65
				'X-RocketChat-Livechat-Token': RocketChat.settings.get('Livechat_secret_token')                                    // 66
			},                                                                                                                  //
			data: sampleData                                                                                                    // 68
		};                                                                                                                   //
                                                                                                                       //
		var response = postCatchError(RocketChat.settings.get('Livechat_webhookUrl'), options);                              // 71
                                                                                                                       //
		console.log('response ->', response);                                                                                // 73
                                                                                                                       //
		if (response && response.statusCode && response.statusCode === 200) {                                                // 75
			return true;                                                                                                        // 76
		} else {                                                                                                             //
			throw new Meteor.Error('error-invalid-webhook-response');                                                           // 78
		}                                                                                                                    //
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/Users.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    //
 * Sets an user as (non)operator                                                                                       //
 * @param {string} _id - User's _id                                                                                    //
 * @param {boolean} operator - Flag to set as operator or not                                                          //
 */                                                                                                                    //
RocketChat.models.Users.setOperator = function (_id, operator) {                                                       // 6
	var update = {                                                                                                        // 7
		$set: {                                                                                                              // 8
			operator: operator                                                                                                  // 9
		}                                                                                                                    //
	};                                                                                                                    //
                                                                                                                       //
	return this.update(_id, update);                                                                                      // 13
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Gets all online agents                                                                                              //
 * @return                                                                                                             //
 */                                                                                                                    //
RocketChat.models.Users.findOnlineAgents = function () {                                                               // 20
	var query = {                                                                                                         // 21
		statusConnection: { $ne: 'offline' },                                                                                // 22
		statusLivechat: 'available',                                                                                         // 23
		roles: 'livechat-agent'                                                                                              // 24
	};                                                                                                                    //
                                                                                                                       //
	return this.find(query);                                                                                              // 27
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Find online users from a list                                                                                       //
 * @param {array} userList - array of usernames                                                                        //
 * @return                                                                                                             //
 */                                                                                                                    //
RocketChat.models.Users.findOnlineUserFromList = function (userList) {                                                 // 35
	var query = {                                                                                                         // 36
		statusConnection: { $ne: 'offline' },                                                                                // 37
		statusLivechat: 'available',                                                                                         // 38
		roles: 'livechat-agent',                                                                                             // 39
		username: {                                                                                                          // 40
			$in: [].concat(userList)                                                                                            // 41
		}                                                                                                                    //
	};                                                                                                                    //
                                                                                                                       //
	return this.find(query);                                                                                              // 45
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Get next user agent in order                                                                                        //
 * @return {object} User from db                                                                                       //
 */                                                                                                                    //
RocketChat.models.Users.getNextAgent = function () {                                                                   // 52
	var query = {                                                                                                         // 53
		statusConnection: { $ne: 'offline' },                                                                                // 54
		statusLivechat: 'available',                                                                                         // 55
		roles: 'livechat-agent'                                                                                              // 56
	};                                                                                                                    //
                                                                                                                       //
	var collectionObj = this.model.rawCollection();                                                                       // 59
	var findAndModify = Meteor.wrapAsync(collectionObj.findAndModify, collectionObj);                                     // 60
                                                                                                                       //
	var sort = {                                                                                                          // 62
		livechatCount: 1,                                                                                                    // 63
		username: 1                                                                                                          // 64
	};                                                                                                                    //
                                                                                                                       //
	var update = {                                                                                                        // 67
		$inc: {                                                                                                              // 68
			livechatCount: 1                                                                                                    // 69
		}                                                                                                                    //
	};                                                                                                                    //
                                                                                                                       //
	var user = findAndModify(query, sort, update);                                                                        // 73
	if (user) {                                                                                                           // 74
		return {                                                                                                             // 75
			agentId: user._id,                                                                                                  // 76
			username: user.username                                                                                             // 77
		};                                                                                                                   //
	} else {                                                                                                              //
		return null;                                                                                                         // 80
	}                                                                                                                     //
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Gets visitor by token                                                                                               //
 * @param {string} token - Visitor token                                                                               //
 */                                                                                                                    //
RocketChat.models.Users.getVisitorByToken = function (token, options) {                                                // 88
	var query = {                                                                                                         // 89
		'profile.guest': true,                                                                                               // 90
		'profile.token': token                                                                                               // 91
	};                                                                                                                    //
                                                                                                                       //
	return this.findOne(query, options);                                                                                  // 94
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Gets visitor by token                                                                                               //
 * @param {string} token - Visitor token                                                                               //
 */                                                                                                                    //
RocketChat.models.Users.findVisitorByToken = function (token) {                                                        // 101
	var query = {                                                                                                         // 102
		'profile.guest': true,                                                                                               // 103
		'profile.token': token                                                                                               // 104
	};                                                                                                                    //
                                                                                                                       //
	return this.find(query);                                                                                              // 107
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Change user's livechat status                                                                                       //
 * @param {string} token - Visitor token                                                                               //
 */                                                                                                                    //
RocketChat.models.Users.setLivechatStatus = function (userId, status) {                                                // 114
	var query = {                                                                                                         // 115
		'_id': userId                                                                                                        // 116
	};                                                                                                                    //
                                                                                                                       //
	var update = {                                                                                                        // 119
		$set: {                                                                                                              // 120
			'statusLivechat': status                                                                                            // 121
		}                                                                                                                    //
	};                                                                                                                    //
                                                                                                                       //
	return this.update(query, update);                                                                                    // 125
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Users.updateLivechatDataByToken = function (token, key, value) {                                     // 128
	var _$set;                                                                                                            //
                                                                                                                       //
	var query = {                                                                                                         // 129
		'profile.token': token                                                                                               // 130
	};                                                                                                                    //
                                                                                                                       //
	var update = {                                                                                                        // 133
		$set: (_$set = {}, _$set['livechatData.' + key] = value, _$set)                                                      // 134
	};                                                                                                                    //
                                                                                                                       //
	return this.update(query, update);                                                                                    // 139
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Find a visitor by their phone number                                                                                //
 * @return {object} User from db                                                                                       //
 */                                                                                                                    //
RocketChat.models.Users.findOneVisitorByPhone = function (phone) {                                                     // 146
	var query = {                                                                                                         // 147
		'phone.phoneNumber': phone                                                                                           // 148
	};                                                                                                                    //
                                                                                                                       //
	return this.findOne(query);                                                                                           // 151
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Get the next visitor name                                                                                           //
 * @return {string} The next visitor name                                                                              //
 */                                                                                                                    //
RocketChat.models.Users.getNextVisitorUsername = function () {                                                         // 158
	var settingsRaw = RocketChat.models.Settings.model.rawCollection();                                                   // 159
	var findAndModify = Meteor.wrapAsync(settingsRaw.findAndModify, settingsRaw);                                         // 160
                                                                                                                       //
	var query = {                                                                                                         // 162
		_id: 'Livechat_guest_count'                                                                                          // 163
	};                                                                                                                    //
                                                                                                                       //
	var update = {                                                                                                        // 166
		$inc: {                                                                                                              // 167
			value: 1                                                                                                            // 168
		}                                                                                                                    //
	};                                                                                                                    //
                                                                                                                       //
	var livechatCount = findAndModify(query, null, update);                                                               // 172
                                                                                                                       //
	return 'guest-' + (livechatCount.value + 1);                                                                          // 174
};                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/Rooms.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    //
 * Gets visitor by token                                                                                               //
 * @param {string} token - Visitor token                                                                               //
 */                                                                                                                    //
RocketChat.models.Rooms.updateSurveyFeedbackById = function (_id, surveyFeedback) {                                    // 5
	var query = {                                                                                                         // 6
		_id: _id                                                                                                             // 7
	};                                                                                                                    //
                                                                                                                       //
	var update = {                                                                                                        // 10
		$set: {                                                                                                              // 11
			surveyFeedback: surveyFeedback                                                                                      // 12
		}                                                                                                                    //
	};                                                                                                                    //
                                                                                                                       //
	return this.update(query, update);                                                                                    // 16
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.updateLivechatDataByToken = function (token, key, value) {                                     // 19
	var _$set;                                                                                                            //
                                                                                                                       //
	var query = {                                                                                                         // 20
		'v.token': token                                                                                                     // 21
	};                                                                                                                    //
                                                                                                                       //
	var update = {                                                                                                        // 24
		$set: (_$set = {}, _$set['livechatData.' + key] = value, _$set)                                                      // 25
	};                                                                                                                    //
                                                                                                                       //
	return this.update(query, update);                                                                                    // 30
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.findLivechat = function () {                                                                   // 33
	var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];                                  //
	var limit = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];                                  //
                                                                                                                       //
	var query = {                                                                                                         // 34
		t: 'l'                                                                                                               // 35
	};                                                                                                                    //
                                                                                                                       //
	return this.find(query, { sort: { ts: -1 }, offset: offset, limit: limit });                                          // 38
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.findLivechatByCode = function (code, fields) {                                                 // 41
	var query = {                                                                                                         // 42
		t: 'l',                                                                                                              // 43
		code: parseInt(code)                                                                                                 // 44
	};                                                                                                                    //
                                                                                                                       //
	var options = {};                                                                                                     // 47
                                                                                                                       //
	if (fields) {                                                                                                         // 49
		options.fields = fields;                                                                                             // 50
	}                                                                                                                     //
                                                                                                                       //
	return this.find(query, options);                                                                                     // 53
};                                                                                                                     //
                                                                                                                       //
/**                                                                                                                    //
 * Get the next visitor name                                                                                           //
 * @return {string} The next visitor name                                                                              //
 */                                                                                                                    //
RocketChat.models.Rooms.getNextLivechatRoomCode = function () {                                                        // 60
	var settingsRaw = RocketChat.models.Settings.model.rawCollection();                                                   // 61
	var findAndModify = Meteor.wrapAsync(settingsRaw.findAndModify, settingsRaw);                                         // 62
                                                                                                                       //
	var query = {                                                                                                         // 64
		_id: 'Livechat_Room_Count'                                                                                           // 65
	};                                                                                                                    //
                                                                                                                       //
	var update = {                                                                                                        // 68
		$inc: {                                                                                                              // 69
			value: 1                                                                                                            // 70
		}                                                                                                                    //
	};                                                                                                                    //
                                                                                                                       //
	var livechatCount = findAndModify(query, null, update);                                                               // 74
                                                                                                                       //
	return livechatCount.value;                                                                                           // 76
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.findOpenByVisitorToken = function (visitorToken, options) {                                    // 79
	var query = {                                                                                                         // 80
		open: true,                                                                                                          // 81
		'v.token': visitorToken                                                                                              // 82
	};                                                                                                                    //
                                                                                                                       //
	return this.find(query, options);                                                                                     // 85
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.findByVisitorToken = function (visitorToken) {                                                 // 88
	var query = {                                                                                                         // 89
		'v.token': visitorToken                                                                                              // 90
	};                                                                                                                    //
                                                                                                                       //
	return this.find(query);                                                                                              // 93
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.findByVisitorId = function (visitorId) {                                                       // 96
	var query = {                                                                                                         // 97
		'v._id': visitorId                                                                                                   // 98
	};                                                                                                                    //
                                                                                                                       //
	return this.find(query);                                                                                              // 101
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.closeByRoomId = function (roomId) {                                                            // 104
	return this.update({ _id: roomId }, { $unset: { open: 1 } });                                                         // 105
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.setLabelByRoomId = function (roomId, label) {                                                  // 108
	return this.update({ _id: roomId }, { $set: { label: label } });                                                      // 109
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.findOpenByAgent = function (userId) {                                                          // 112
	var query = {                                                                                                         // 113
		open: true,                                                                                                          // 114
		'servedBy._id': userId                                                                                               // 115
	};                                                                                                                    //
                                                                                                                       //
	return this.find(query);                                                                                              // 118
};                                                                                                                     //
                                                                                                                       //
RocketChat.models.Rooms.changeAgentByRoomId = function (roomId, newUsernames, newAgent) {                              // 121
	var query = {                                                                                                         // 122
		_id: roomId                                                                                                          // 123
	};                                                                                                                    //
	var update = {                                                                                                        // 125
		$set: {                                                                                                              // 126
			usernames: newUsernames,                                                                                            // 127
			servedBy: {                                                                                                         // 128
				_id: newAgent.agentId,                                                                                             // 129
				username: newAgent.username                                                                                        // 130
			}                                                                                                                   //
		}                                                                                                                    //
	};                                                                                                                    //
                                                                                                                       //
	this.update(query, update);                                                                                           // 135
};                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/LivechatExternalMessage.js                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var LivechatExternalMessage = (function (_RocketChat$models$_Base) {                                                   //
	babelHelpers.inherits(LivechatExternalMessage, _RocketChat$models$_Base);                                             //
                                                                                                                       //
	function LivechatExternalMessage() {                                                                                  // 2
		babelHelpers.classCallCheck(this, LivechatExternalMessage);                                                          //
                                                                                                                       //
		_RocketChat$models$_Base.call(this);                                                                                 // 3
		this._initModel('livechat_external_message');                                                                        // 4
	}                                                                                                                     //
                                                                                                                       //
	// FIND                                                                                                               //
                                                                                                                       //
	LivechatExternalMessage.prototype.findByRoomId = (function () {                                                       // 1
		function findByRoomId(roomId) {                                                                                      // 8
			var sort = arguments.length <= 1 || arguments[1] === undefined ? { ts: -1 } : arguments[1];                         //
                                                                                                                       //
			var query = { rid: roomId };                                                                                        // 9
                                                                                                                       //
			return this.find(query, { sort: sort });                                                                            // 11
		}                                                                                                                    //
                                                                                                                       //
		return findByRoomId;                                                                                                 //
	})();                                                                                                                 //
                                                                                                                       //
	return LivechatExternalMessage;                                                                                       //
})(RocketChat.models._Base);                                                                                           //
                                                                                                                       //
RocketChat.models.LivechatExternalMessage = new LivechatExternalMessage();                                             // 15
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/LivechatCustomField.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    //
 * Livechat Custom Fields model                                                                                        //
 */                                                                                                                    //
                                                                                                                       //
var LivechatCustomField = (function (_RocketChat$models$_Base) {                                                       //
	babelHelpers.inherits(LivechatCustomField, _RocketChat$models$_Base);                                                 //
                                                                                                                       //
	function LivechatCustomField() {                                                                                      // 5
		babelHelpers.classCallCheck(this, LivechatCustomField);                                                              //
                                                                                                                       //
		_RocketChat$models$_Base.call(this);                                                                                 // 6
		this._initModel('livechat_custom_field');                                                                            // 7
	}                                                                                                                     //
                                                                                                                       //
	// FIND                                                                                                               //
                                                                                                                       //
	LivechatCustomField.prototype.findOneById = (function () {                                                            // 4
		function findOneById(_id, options) {                                                                                 // 11
			var query = { _id: _id };                                                                                           // 12
                                                                                                                       //
			return this.findOne(query, options);                                                                                // 14
		}                                                                                                                    //
                                                                                                                       //
		return findOneById;                                                                                                  //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatCustomField.prototype.createOrUpdateCustomField = (function () {                                              // 4
		function createOrUpdateCustomField(_id, field, label, scope, visibility, extraData) {                                // 17
			var record = {                                                                                                      // 18
				label: label,                                                                                                      // 19
				scope: scope,                                                                                                      // 20
				visibility: visibility                                                                                             // 21
			};                                                                                                                  //
                                                                                                                       //
			_.extend(record, extraData);                                                                                        // 24
                                                                                                                       //
			if (_id) {                                                                                                          // 26
				this.update({ _id: _id }, { $set: record });                                                                       // 27
			} else {                                                                                                            //
				record._id = field;                                                                                                // 29
				_id = this.insert(record);                                                                                         // 30
			}                                                                                                                   //
                                                                                                                       //
			return record;                                                                                                      // 33
		}                                                                                                                    //
                                                                                                                       //
		return createOrUpdateCustomField;                                                                                    //
	})();                                                                                                                 //
                                                                                                                       //
	// REMOVE                                                                                                             //
                                                                                                                       //
	LivechatCustomField.prototype.removeById = (function () {                                                             // 4
		function removeById(_id) {                                                                                           // 37
			var query = { _id: _id };                                                                                           // 38
                                                                                                                       //
			return this.remove(query);                                                                                          // 40
		}                                                                                                                    //
                                                                                                                       //
		return removeById;                                                                                                   //
	})();                                                                                                                 //
                                                                                                                       //
	return LivechatCustomField;                                                                                           //
})(RocketChat.models._Base);                                                                                           //
                                                                                                                       //
RocketChat.models.LivechatCustomField = new LivechatCustomField();                                                     // 44
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/LivechatDepartment.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    //
 * Livechat Department model                                                                                           //
 */                                                                                                                    //
                                                                                                                       //
var LivechatDepartment = (function (_RocketChat$models$_Base) {                                                        //
	babelHelpers.inherits(LivechatDepartment, _RocketChat$models$_Base);                                                  //
                                                                                                                       //
	function LivechatDepartment() {                                                                                       // 5
		babelHelpers.classCallCheck(this, LivechatDepartment);                                                               //
                                                                                                                       //
		_RocketChat$models$_Base.call(this);                                                                                 // 6
		this._initModel('livechat_department');                                                                              // 7
	}                                                                                                                     //
                                                                                                                       //
	// FIND                                                                                                               //
                                                                                                                       //
	LivechatDepartment.prototype.findOneById = (function () {                                                             // 4
		function findOneById(_id, options) {                                                                                 // 11
			var query = { _id: _id };                                                                                           // 12
                                                                                                                       //
			return this.findOne(query, options);                                                                                // 14
		}                                                                                                                    //
                                                                                                                       //
		return findOneById;                                                                                                  //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatDepartment.prototype.findByDepartmentId = (function () {                                                      // 4
		function findByDepartmentId(_id, options) {                                                                          // 17
			var query = { _id: _id };                                                                                           // 18
                                                                                                                       //
			return this.find(query, options);                                                                                   // 20
		}                                                                                                                    //
                                                                                                                       //
		return findByDepartmentId;                                                                                           //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatDepartment.prototype.createOrUpdateDepartment = (function () {                                                // 4
		function createOrUpdateDepartment(_id, enabled, name, description, agents, extraData) {                              // 23
			agents = [].concat(agents);                                                                                         // 24
                                                                                                                       //
			var record = {                                                                                                      // 26
				enabled: enabled,                                                                                                  // 27
				name: name,                                                                                                        // 28
				description: description,                                                                                          // 29
				numAgents: agents.length                                                                                           // 30
			};                                                                                                                  //
                                                                                                                       //
			_.extend(record, extraData);                                                                                        // 33
                                                                                                                       //
			if (_id) {                                                                                                          // 35
				this.update({ _id: _id }, { $set: record });                                                                       // 36
			} else {                                                                                                            //
				_id = this.insert(record);                                                                                         // 38
			}                                                                                                                   //
                                                                                                                       //
			var savedAgents = _.pluck(RocketChat.models.LivechatDepartmentAgents.findByDepartmentId(_id).fetch(), 'agentId');   // 41
			var agentsToSave = _.pluck(agents, 'agentId');                                                                      // 42
                                                                                                                       //
			// remove other agents                                                                                              //
			_.difference(savedAgents, agentsToSave).forEach(function (agentId) {                                                // 45
				RocketChat.models.LivechatDepartmentAgents.removeByDepartmentIdAndAgentId(_id, agentId);                           // 46
			});                                                                                                                 //
                                                                                                                       //
			agents.forEach(function (agent) {                                                                                   // 49
				RocketChat.models.LivechatDepartmentAgents.saveAgent({                                                             // 50
					agentId: agent.agentId,                                                                                           // 51
					departmentId: _id,                                                                                                // 52
					username: agent.username,                                                                                         // 53
					count: parseInt(agent.count),                                                                                     // 54
					order: parseInt(agent.order)                                                                                      // 55
				});                                                                                                                //
			});                                                                                                                 //
                                                                                                                       //
			return _.extend(record, { _id: _id });                                                                              // 59
		}                                                                                                                    //
                                                                                                                       //
		return createOrUpdateDepartment;                                                                                     //
	})();                                                                                                                 //
                                                                                                                       //
	// REMOVE                                                                                                             //
                                                                                                                       //
	LivechatDepartment.prototype.removeById = (function () {                                                              // 4
		function removeById(_id) {                                                                                           // 63
			var query = { _id: _id };                                                                                           // 64
                                                                                                                       //
			return this.remove(query);                                                                                          // 66
		}                                                                                                                    //
                                                                                                                       //
		return removeById;                                                                                                   //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatDepartment.prototype.findEnabledWithAgents = (function () {                                                   // 4
		function findEnabledWithAgents() {                                                                                   // 69
			var query = {                                                                                                       // 70
				numAgents: { $gt: 0 },                                                                                             // 71
				enabled: true                                                                                                      // 72
			};                                                                                                                  //
			return this.find(query);                                                                                            // 74
		}                                                                                                                    //
                                                                                                                       //
		return findEnabledWithAgents;                                                                                        //
	})();                                                                                                                 //
                                                                                                                       //
	return LivechatDepartment;                                                                                            //
})(RocketChat.models._Base);                                                                                           //
                                                                                                                       //
RocketChat.models.LivechatDepartment = new LivechatDepartment();                                                       // 78
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/LivechatDepartmentAgents.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    //
 * Livechat Department model                                                                                           //
 */                                                                                                                    //
                                                                                                                       //
var LivechatDepartmentAgents = (function (_RocketChat$models$_Base) {                                                  //
	babelHelpers.inherits(LivechatDepartmentAgents, _RocketChat$models$_Base);                                            //
                                                                                                                       //
	function LivechatDepartmentAgents() {                                                                                 // 5
		babelHelpers.classCallCheck(this, LivechatDepartmentAgents);                                                         //
                                                                                                                       //
		_RocketChat$models$_Base.call(this);                                                                                 // 6
		this._initModel('livechat_department_agents');                                                                       // 7
	}                                                                                                                     //
                                                                                                                       //
	LivechatDepartmentAgents.prototype.findByDepartmentId = (function () {                                                // 4
		function findByDepartmentId(departmentId) {                                                                          // 10
			return this.find({ departmentId: departmentId });                                                                   // 11
		}                                                                                                                    //
                                                                                                                       //
		return findByDepartmentId;                                                                                           //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatDepartmentAgents.prototype.saveAgent = (function () {                                                         // 4
		function saveAgent(agent) {                                                                                          // 14
			return this.upsert({                                                                                                // 15
				agentId: agent.agentId,                                                                                            // 16
				departmentId: agent.departmentId                                                                                   // 17
			}, {                                                                                                                //
				$set: {                                                                                                            // 19
					username: agent.username,                                                                                         // 20
					count: parseInt(agent.count),                                                                                     // 21
					order: parseInt(agent.order)                                                                                      // 22
				}                                                                                                                  //
			});                                                                                                                 //
		}                                                                                                                    //
                                                                                                                       //
		return saveAgent;                                                                                                    //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatDepartmentAgents.prototype.removeByDepartmentIdAndAgentId = (function () {                                    // 4
		function removeByDepartmentIdAndAgentId(departmentId, agentId) {                                                     // 27
			this.remove({ departmentId: departmentId, agentId: agentId });                                                      // 28
		}                                                                                                                    //
                                                                                                                       //
		return removeByDepartmentIdAndAgentId;                                                                               //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatDepartmentAgents.prototype.getNextAgentForDepartment = (function () {                                         // 4
		function getNextAgentForDepartment(departmentId) {                                                                   // 31
			var agents = this.findByDepartmentId(departmentId).fetch();                                                         // 32
                                                                                                                       //
			if (agents.length === 0) {                                                                                          // 34
				return;                                                                                                            // 35
			}                                                                                                                   //
                                                                                                                       //
			var onlineUsers = RocketChat.models.Users.findOnlineUserFromList(_.pluck(agents, 'username'));                      // 38
                                                                                                                       //
			var onlineUsernames = _.pluck(onlineUsers.fetch(), 'username');                                                     // 40
                                                                                                                       //
			var query = {                                                                                                       // 42
				departmentId: departmentId,                                                                                        // 43
				username: {                                                                                                        // 44
					$in: onlineUsernames                                                                                              // 45
				}                                                                                                                  //
			};                                                                                                                  //
                                                                                                                       //
			var sort = {                                                                                                        // 49
				count: 1,                                                                                                          // 50
				sort: 1,                                                                                                           // 51
				username: 1                                                                                                        // 52
			};                                                                                                                  //
			var update = {                                                                                                      // 54
				$inc: {                                                                                                            // 55
					count: 1                                                                                                          // 56
				}                                                                                                                  //
			};                                                                                                                  //
                                                                                                                       //
			var collectionObj = this.model.rawCollection();                                                                     // 60
			var findAndModify = Meteor.wrapAsync(collectionObj.findAndModify, collectionObj);                                   // 61
                                                                                                                       //
			var agent = findAndModify(query, sort, update);                                                                     // 63
			if (agent) {                                                                                                        // 64
				return {                                                                                                           // 65
					agentId: agent.agentId,                                                                                           // 66
					username: agent.username                                                                                          // 67
				};                                                                                                                 //
			} else {                                                                                                            //
				return null;                                                                                                       // 70
			}                                                                                                                   //
		}                                                                                                                    //
                                                                                                                       //
		return getNextAgentForDepartment;                                                                                    //
	})();                                                                                                                 //
                                                                                                                       //
	return LivechatDepartmentAgents;                                                                                      //
})(RocketChat.models._Base);                                                                                           //
                                                                                                                       //
RocketChat.models.LivechatDepartmentAgents = new LivechatDepartmentAgents();                                           // 75
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/LivechatPageVisited.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    //
 * Livechat Page Visited model                                                                                         //
 */                                                                                                                    //
                                                                                                                       //
var LivechatPageVisited = (function (_RocketChat$models$_Base) {                                                       //
	babelHelpers.inherits(LivechatPageVisited, _RocketChat$models$_Base);                                                 //
                                                                                                                       //
	function LivechatPageVisited() {                                                                                      // 5
		babelHelpers.classCallCheck(this, LivechatPageVisited);                                                              //
                                                                                                                       //
		_RocketChat$models$_Base.call(this);                                                                                 // 6
		this._initModel('livechat_page_visited');                                                                            // 7
                                                                                                                       //
		this.tryEnsureIndex({ 'token': 1 });                                                                                 // 9
		this.tryEnsureIndex({ 'ts': 1 });                                                                                    // 10
                                                                                                                       //
		// keep history for 1 month if the visitor does not register                                                         //
		this.tryEnsureIndex({ 'expireAt': 1 }, { sparse: 1, expireAfterSeconds: 0 });                                        // 13
	}                                                                                                                     //
                                                                                                                       //
	LivechatPageVisited.prototype.saveByToken = (function () {                                                            // 4
		function saveByToken(token, pageInfo) {                                                                              // 16
			// keep history of unregistered visitors for 1 month                                                                //
			var keepHistoryMiliseconds = 2592000000;                                                                            // 18
                                                                                                                       //
			return this.insert({                                                                                                // 20
				token: token,                                                                                                      // 21
				page: pageInfo,                                                                                                    // 22
				ts: new Date(),                                                                                                    // 23
				expireAt: new Date().getTime() + keepHistoryMiliseconds                                                            // 24
			});                                                                                                                 //
		}                                                                                                                    //
                                                                                                                       //
		return saveByToken;                                                                                                  //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatPageVisited.prototype.findByToken = (function () {                                                            // 4
		function findByToken(token) {                                                                                        // 28
			return this.find({ token: token }, { sort: { ts: -1 }, limit: 20 });                                                // 29
		}                                                                                                                    //
                                                                                                                       //
		return findByToken;                                                                                                  //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatPageVisited.prototype.keepHistoryForToken = (function () {                                                    // 4
		function keepHistoryForToken(token) {                                                                                // 32
			return this.update({                                                                                                // 33
				token: token,                                                                                                      // 34
				expireAt: {                                                                                                        // 35
					$exists: true                                                                                                     // 36
				}                                                                                                                  //
			}, {                                                                                                                //
				$unset: {                                                                                                          // 39
					expireAt: 1                                                                                                       // 40
				}                                                                                                                  //
			}, {                                                                                                                //
				multi: true                                                                                                        // 43
			});                                                                                                                 //
		}                                                                                                                    //
                                                                                                                       //
		return keepHistoryForToken;                                                                                          //
	})();                                                                                                                 //
                                                                                                                       //
	return LivechatPageVisited;                                                                                           //
})(RocketChat.models._Base);                                                                                           //
                                                                                                                       //
RocketChat.models.LivechatPageVisited = new LivechatPageVisited();                                                     // 48
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/LivechatTrigger.js                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                    //
 * Livechat Trigger model                                                                                              //
 */                                                                                                                    //
                                                                                                                       //
var LivechatTrigger = (function (_RocketChat$models$_Base) {                                                           //
	babelHelpers.inherits(LivechatTrigger, _RocketChat$models$_Base);                                                     //
                                                                                                                       //
	function LivechatTrigger() {                                                                                          // 5
		babelHelpers.classCallCheck(this, LivechatTrigger);                                                                  //
                                                                                                                       //
		_RocketChat$models$_Base.call(this);                                                                                 // 6
		this._initModel('livechat_trigger');                                                                                 // 7
	}                                                                                                                     //
                                                                                                                       //
	// FIND                                                                                                               //
                                                                                                                       //
	LivechatTrigger.prototype.save = (function () {                                                                       // 4
		function save(data) {                                                                                                // 11
			var trigger = this.findOne();                                                                                       // 12
                                                                                                                       //
			if (trigger) {                                                                                                      // 14
				return this.update({ _id: trigger._id }, { $set: data });                                                          // 15
			} else {                                                                                                            //
				return this.insert(data);                                                                                          // 17
			}                                                                                                                   //
		}                                                                                                                    //
                                                                                                                       //
		return save;                                                                                                         //
	})();                                                                                                                 //
                                                                                                                       //
	LivechatTrigger.prototype.removeAll = (function () {                                                                  // 4
		function removeAll() {                                                                                               // 21
			this.remove({});                                                                                                    // 22
		}                                                                                                                    //
                                                                                                                       //
		return removeAll;                                                                                                    //
	})();                                                                                                                 //
                                                                                                                       //
	return LivechatTrigger;                                                                                               //
})(RocketChat.models._Base);                                                                                           //
                                                                                                                       //
RocketChat.models.LivechatTrigger = new LivechatTrigger();                                                             // 26
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/models/indexes.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.startup(function () {                                                                                           // 1
	RocketChat.models.Rooms.tryEnsureIndex({ code: 1 });                                                                  // 2
	RocketChat.models.Rooms.tryEnsureIndex({ open: 1 }, { sparse: 1 });                                                   // 3
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/lib/Livechat.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
RocketChat.Livechat = {                                                                                                // 1
	logger: new Logger('Livechat', {                                                                                      // 2
		sections: {                                                                                                          // 3
			webhook: 'Webhook'                                                                                                  // 4
		}                                                                                                                    //
	}),                                                                                                                   //
                                                                                                                       //
	getNextAgent: function (department) {                                                                                 // 8
		if (department) {                                                                                                    // 9
			return RocketChat.models.LivechatDepartmentAgents.getNextAgentForDepartment(department);                            // 10
		} else {                                                                                                             //
			return RocketChat.models.Users.getNextAgent();                                                                      // 12
		}                                                                                                                    //
	},                                                                                                                    //
	sendMessage: function (_ref) {                                                                                        // 15
		var guest = _ref.guest;                                                                                              //
		var message = _ref.message;                                                                                          //
		var roomInfo = _ref.roomInfo;                                                                                        //
                                                                                                                       //
		var room = RocketChat.models.Rooms.findOneById(message.rid);                                                         // 16
		var newRoom = false;                                                                                                 // 17
                                                                                                                       //
		if (room && !room.open) {                                                                                            // 19
			message.rid = Random.id();                                                                                          // 20
			room = null;                                                                                                        // 21
		}                                                                                                                    //
                                                                                                                       //
		if (room == null) {                                                                                                  // 24
                                                                                                                       //
			// if no department selected verify if there is only one active and use it                                          //
			if (!guest.department) {                                                                                            // 27
				var departments = RocketChat.models.LivechatDepartment.findEnabledWithAgents();                                    // 28
				if (departments.count() === 1) {                                                                                   // 29
					guest.department = departments.fetch()[0]._id;                                                                    // 30
				}                                                                                                                  //
			}                                                                                                                   //
                                                                                                                       //
			var agent = RocketChat.Livechat.getNextAgent(guest.department);                                                     // 34
			if (!agent) {                                                                                                       // 35
				throw new Meteor.Error('no-agent-online', 'Sorry, no online agents');                                              // 36
			}                                                                                                                   //
                                                                                                                       //
			var roomCode = RocketChat.models.Rooms.getNextLivechatRoomCode();                                                   // 39
                                                                                                                       //
			room = _.extend({                                                                                                   // 41
				_id: message.rid,                                                                                                  // 42
				msgs: 1,                                                                                                           // 43
				lm: new Date(),                                                                                                    // 44
				code: roomCode,                                                                                                    // 45
				label: guest.name || guest.username,                                                                               // 46
				usernames: [agent.username, guest.username],                                                                       // 47
				t: 'l',                                                                                                            // 48
				ts: new Date(),                                                                                                    // 49
				v: {                                                                                                               // 50
					_id: guest._id,                                                                                                   // 51
					token: message.token                                                                                              // 52
				},                                                                                                                 //
				servedBy: {                                                                                                        // 54
					_id: agent.agentId,                                                                                               // 55
					username: agent.username                                                                                          // 56
				},                                                                                                                 //
				open: true                                                                                                         // 58
			}, roomInfo);                                                                                                       //
			var subscriptionData = {                                                                                            // 60
				rid: message.rid,                                                                                                  // 61
				name: guest.name || guest.username,                                                                                // 62
				alert: true,                                                                                                       // 63
				open: true,                                                                                                        // 64
				unread: 1,                                                                                                         // 65
				answered: false,                                                                                                   // 66
				code: roomCode,                                                                                                    // 67
				u: {                                                                                                               // 68
					_id: agent.agentId,                                                                                               // 69
					username: agent.username                                                                                          // 70
				},                                                                                                                 //
				t: 'l',                                                                                                            // 72
				desktopNotifications: 'all',                                                                                       // 73
				mobilePushNotifications: 'all',                                                                                    // 74
				emailNotifications: 'all'                                                                                          // 75
			};                                                                                                                  //
                                                                                                                       //
			RocketChat.models.Rooms.insert(room);                                                                               // 78
			RocketChat.models.Subscriptions.insert(subscriptionData);                                                           // 79
                                                                                                                       //
			newRoom = true;                                                                                                     // 81
		} else {                                                                                                             //
			room = Meteor.call('canAccessRoom', message.rid, guest._id);                                                        // 83
		}                                                                                                                    //
		if (!room) {                                                                                                         // 85
			throw new Meteor.Error('cannot-acess-room');                                                                        // 86
		}                                                                                                                    //
		return _.extend(RocketChat.sendMessage(guest, message, room), { newRoom: newRoom });                                 // 88
	},                                                                                                                    //
	registerGuest: function () {                                                                                          // 90
		var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];                                 //
                                                                                                                       //
		var token = _ref2.token;                                                                                             //
		var name = _ref2.name;                                                                                               //
		var email = _ref2.email;                                                                                             //
		var department = _ref2.department;                                                                                   //
		var phone = _ref2.phone;                                                                                             //
		var loginToken = _ref2.loginToken;                                                                                   //
		var username = _ref2.username;                                                                                       //
                                                                                                                       //
		check(token, String);                                                                                                // 91
                                                                                                                       //
		var user = RocketChat.models.Users.getVisitorByToken(token, { fields: { _id: 1 } });                                 // 93
                                                                                                                       //
		if (user) {                                                                                                          // 95
			throw new Meteor.Error('token-already-exists', 'Token already exists');                                             // 96
		}                                                                                                                    //
                                                                                                                       //
		if (!username) {                                                                                                     // 99
			username = RocketChat.models.Users.getNextVisitorUsername();                                                        // 100
		}                                                                                                                    //
                                                                                                                       //
		var updateUser = {                                                                                                   // 103
			$set: {                                                                                                             // 104
				profile: {                                                                                                         // 105
					guest: true,                                                                                                      // 106
					token: token                                                                                                      // 107
				}                                                                                                                  //
			}                                                                                                                   //
		};                                                                                                                   //
                                                                                                                       //
		var existingUser = null;                                                                                             // 112
                                                                                                                       //
		var userId;                                                                                                          // 114
                                                                                                                       //
		if (s.trim(email) !== '' && (existingUser = RocketChat.models.Users.findOneByEmailAddress(email))) {                 // 116
			if (existingUser.type !== 'visitor') {                                                                              // 117
				throw new Meteor.Error('error-invalid-user', 'This email belongs to a registered user.');                          // 118
			}                                                                                                                   //
                                                                                                                       //
			updateUser.$addToSet = {                                                                                            // 121
				globalRoles: 'livechat-guest'                                                                                      // 122
			};                                                                                                                  //
                                                                                                                       //
			if (loginToken) {                                                                                                   // 125
				updateUser.$addToSet['services.resume.loginTokens'] = loginToken;                                                  // 126
			}                                                                                                                   //
                                                                                                                       //
			userId = existingUser._id;                                                                                          // 129
		} else {                                                                                                             //
			updateUser.$set.name = name;                                                                                        // 131
                                                                                                                       //
			var userData = {                                                                                                    // 133
				username: username,                                                                                                // 134
				globalRoles: ['livechat-guest'],                                                                                   // 135
				department: department,                                                                                            // 136
				type: 'visitor'                                                                                                    // 137
			};                                                                                                                  //
                                                                                                                       //
			if (this.connection) {                                                                                              // 140
				userData.userAgent = this.connection.httpHeaders['user-agent'];                                                    // 141
				userData.ip = this.connection.httpHeaders['x-real-ip'] || this.connection.clientAddress;                           // 142
				userData.host = this.connection.httpHeaders.host;                                                                  // 143
			}                                                                                                                   //
                                                                                                                       //
			userId = Accounts.insertUserDoc({}, userData);                                                                      // 146
                                                                                                                       //
			if (loginToken) {                                                                                                   // 148
				updateUser.$set.services = {                                                                                       // 149
					resume: {                                                                                                         // 150
						loginTokens: [loginToken]                                                                                        // 151
					}                                                                                                                 //
				};                                                                                                                 //
			}                                                                                                                   //
		}                                                                                                                    //
                                                                                                                       //
		if (phone) {                                                                                                         // 157
			updateUser.$set.phone = [{ phoneNumber: phone.number }];                                                            // 158
		}                                                                                                                    //
                                                                                                                       //
		if (email && email.trim() !== '') {                                                                                  // 163
			updateUser.$set.emails = [{ address: email }];                                                                      // 164
		}                                                                                                                    //
                                                                                                                       //
		Meteor.users.update(userId, updateUser);                                                                             // 169
                                                                                                                       //
		return userId;                                                                                                       // 171
	},                                                                                                                    //
                                                                                                                       //
	saveGuest: function (_ref3) {                                                                                         // 174
		var _id = _ref3._id;                                                                                                 //
		var name = _ref3.name;                                                                                               //
		var email = _ref3.email;                                                                                             //
		var phone = _ref3.phone;                                                                                             //
                                                                                                                       //
		var updateData = {};                                                                                                 // 175
                                                                                                                       //
		if (name) {                                                                                                          // 177
			updateData.name = name;                                                                                             // 178
		}                                                                                                                    //
		if (email) {                                                                                                         // 180
			updateData.email = email;                                                                                           // 181
		}                                                                                                                    //
		if (phone) {                                                                                                         // 183
			updateData.phone = phone;                                                                                           // 184
		}                                                                                                                    //
		return RocketChat.models.Users.saveUserById(_id, updateData);                                                        // 186
	},                                                                                                                    //
                                                                                                                       //
	closeRoom: function (_ref4) {                                                                                         // 189
		var user = _ref4.user;                                                                                               //
		var room = _ref4.room;                                                                                               //
		var comment = _ref4.comment;                                                                                         //
                                                                                                                       //
		RocketChat.models.Rooms.closeByRoomId(room._id);                                                                     // 190
                                                                                                                       //
		var message = {                                                                                                      // 192
			t: 'livechat-close',                                                                                                // 193
			msg: comment,                                                                                                       // 194
			groupable: false                                                                                                    // 195
		};                                                                                                                   //
                                                                                                                       //
		RocketChat.sendMessage(user, message, room);                                                                         // 198
                                                                                                                       //
		RocketChat.models.Subscriptions.hideByRoomIdAndUserId(room._id, user._id);                                           // 200
                                                                                                                       //
		Meteor.defer(function () {                                                                                           // 202
			RocketChat.callbacks.run('closeLivechat', room);                                                                    // 203
		});                                                                                                                  //
                                                                                                                       //
		return true;                                                                                                         // 206
	},                                                                                                                    //
                                                                                                                       //
	getInitSettings: function () {                                                                                        // 209
		var settings = {};                                                                                                   // 210
                                                                                                                       //
		RocketChat.models.Settings.findNotHiddenPublic(['Livechat_title', 'Livechat_title_color', 'Livechat_enabled', 'Livechat_registration_form', 'Livechat_offline_title', 'Livechat_offline_title_color', 'Livechat_offline_message', 'Livechat_offline_success_message', 'Livechat_offline_form_unavailable', 'Livechat_display_offline_form', 'Language']).forEach(function (setting) {
			settings[setting._id] = setting.value;                                                                              // 225
		});                                                                                                                  //
                                                                                                                       //
		return settings;                                                                                                     // 228
	},                                                                                                                    //
                                                                                                                       //
	saveRoomInfo: function (roomData, guestData) {                                                                        // 231
		if (!RocketChat.models.Rooms.saveRoomById(roomData._id, roomData)) {                                                 // 232
			return false;                                                                                                       // 233
		}                                                                                                                    //
                                                                                                                       //
		if (!_.isEmpty(guestData.name)) {                                                                                    // 236
			return RocketChat.models.Rooms.setLabelByRoomId(roomData._id, guestData.name) && RocketChat.models.Subscriptions.updateNameByRoomId(roomData._id, guestData.name);
		}                                                                                                                    //
	},                                                                                                                    //
                                                                                                                       //
	forwardOpenChats: function (userId) {                                                                                 // 241
		RocketChat.models.Rooms.findOpenByAgent(userId).forEach(function (room) {                                            // 242
			var guest = RocketChat.models.Users.findOneById(room.v._id);                                                        // 243
                                                                                                                       //
			var agent = RocketChat.Livechat.getNextAgent(guest.department);                                                     // 245
			if (agent && agent.agentId !== userId) {                                                                            // 246
				room.usernames = _.without(room.usernames, room.servedBy.username).concat(agent.username);                         // 247
                                                                                                                       //
				RocketChat.models.Rooms.changeAgentByRoomId(room._id, room.usernames, agent);                                      // 249
                                                                                                                       //
				var subscriptionData = {                                                                                           // 251
					rid: room._id,                                                                                                    // 252
					name: guest.name || guest.username,                                                                               // 253
					alert: true,                                                                                                      // 254
					open: true,                                                                                                       // 255
					unread: 1,                                                                                                        // 256
					answered: false,                                                                                                  // 257
					code: room.code,                                                                                                  // 258
					u: {                                                                                                              // 259
						_id: agent.agentId,                                                                                              // 260
						username: agent.username                                                                                         // 261
					},                                                                                                                //
					t: 'l',                                                                                                           // 263
					desktopNotifications: 'all',                                                                                      // 264
					mobilePushNotifications: 'all',                                                                                   // 265
					emailNotifications: 'all'                                                                                         // 266
				};                                                                                                                 //
				RocketChat.models.Subscriptions.removeByRoomIdAndUserId(room._id, room.servedBy._id);                              // 268
                                                                                                                       //
				RocketChat.models.Subscriptions.insert(subscriptionData);                                                          // 270
                                                                                                                       //
				RocketChat.models.Messages.createUserLeaveWithRoomIdAndUser(room._id, { _id: room.servedBy._id, username: room.servedBy.username });
				RocketChat.models.Messages.createUserJoinWithRoomIdAndUser(room._id, { _id: agent.agentId, username: agent.username });
			}                                                                                                                   //
		});                                                                                                                  //
	}                                                                                                                     //
};                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/sendMessageBySMS.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
RocketChat.callbacks.add('afterSaveMessage', function (message, room) {                                                // 1
	// skips this callback if the message was edited                                                                      //
	if (message.editedAt) {                                                                                               // 3
		return message;                                                                                                      // 4
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.SMS.enabled) {                                                                                        // 7
		return message;                                                                                                      // 8
	}                                                                                                                     //
                                                                                                                       //
	// only send the sms by SMS if it is a livechat room with SMS set to true                                             //
	if (!(typeof room.t !== 'undefined' && room.t === 'l' && room.sms && room.v && room.v.token)) {                       // 12
		return message;                                                                                                      // 13
	}                                                                                                                     //
                                                                                                                       //
	// if the message has a token, it was sent from the visitor, so ignore it                                             //
	if (message.token) {                                                                                                  // 17
		return message;                                                                                                      // 18
	}                                                                                                                     //
                                                                                                                       //
	// if the message has a type means it is a special message (like the closing comment), so skips                       //
	if (message.t) {                                                                                                      // 22
		return message;                                                                                                      // 23
	}                                                                                                                     //
                                                                                                                       //
	var SMSService = RocketChat.SMS.getService(RocketChat.settings.get('SMS_Service'));                                   // 26
                                                                                                                       //
	if (!SMSService) {                                                                                                    // 28
		return message;                                                                                                      // 29
	}                                                                                                                     //
                                                                                                                       //
	var visitor = RocketChat.models.Users.getVisitorByToken(room.v.token);                                                // 32
                                                                                                                       //
	if (!visitor || !visitor.profile || !visitor.phone || visitor.phone.length === 0) {                                   // 34
		return message;                                                                                                      // 35
	}                                                                                                                     //
                                                                                                                       //
	SMSService.send(room.sms.from, visitor.phone[0].phoneNumber, message.msg);                                            // 38
                                                                                                                       //
	return message;                                                                                                       // 40
}, RocketChat.callbacks.priority.LOW);                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/externalMessageHook.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* globals HTTP, SystemLogger */                                                                                       //
                                                                                                                       //
var knowledgeEnabled = false;                                                                                          // 3
var apiaiKey = '';                                                                                                     // 4
var apiaiLanguage = 'en';                                                                                              // 5
RocketChat.settings.get('Livechat_Knowledge_Enabled', function (key, value) {                                          // 6
	knowledgeEnabled = value;                                                                                             // 7
});                                                                                                                    //
RocketChat.settings.get('Livechat_Knowledge_Apiai_Key', function (key, value) {                                        // 9
	apiaiKey = value;                                                                                                     // 10
});                                                                                                                    //
RocketChat.settings.get('Livechat_Knowledge_Apiai_Language', function (key, value) {                                   // 12
	apiaiLanguage = value;                                                                                                // 13
});                                                                                                                    //
                                                                                                                       //
RocketChat.callbacks.add('afterSaveMessage', function (message, room) {                                                // 16
	// skips this callback if the message was edited                                                                      //
	if (message.editedAt) {                                                                                               // 18
		return message;                                                                                                      // 19
	}                                                                                                                     //
                                                                                                                       //
	if (!knowledgeEnabled) {                                                                                              // 22
		return message;                                                                                                      // 23
	}                                                                                                                     //
                                                                                                                       //
	if (!(typeof room.t !== 'undefined' && room.t === 'l' && room.v && room.v.token)) {                                   // 26
		return message;                                                                                                      // 27
	}                                                                                                                     //
                                                                                                                       //
	// if the message hasn't a token, it was not sent by the visitor, so ignore it                                        //
	if (!message.token) {                                                                                                 // 31
		return message;                                                                                                      // 32
	}                                                                                                                     //
                                                                                                                       //
	Meteor.defer(function () {                                                                                            // 35
		try {                                                                                                                // 36
			var response = HTTP.post('https://api.api.ai/api/query?v=20150910', {                                               // 37
				data: {                                                                                                            // 38
					query: message.msg,                                                                                               // 39
					lang: apiaiLanguage                                                                                               // 40
				},                                                                                                                 //
				headers: {                                                                                                         // 42
					'Content-Type': 'application/json; charset=utf-8',                                                                // 43
					'Authorization': 'Bearer ' + apiaiKey                                                                             // 44
				}                                                                                                                  //
			});                                                                                                                 //
                                                                                                                       //
			if (response.data && response.data.status.code === 200 && !_.isEmpty(response.data.result.fulfillment.speech)) {    // 48
				RocketChat.models.LivechatExternalMessage.insert({                                                                 // 49
					rid: message.rid,                                                                                                 // 50
					msg: response.data.result.fulfillment.speech,                                                                     // 51
					orig: message._id,                                                                                                // 52
					ts: new Date()                                                                                                    // 53
				});                                                                                                                //
			}                                                                                                                   //
		} catch (e) {                                                                                                        //
			SystemLogger.error('Error using Api.ai ->', e);                                                                     // 57
		}                                                                                                                    //
	});                                                                                                                   //
                                                                                                                       //
	return message;                                                                                                       // 61
}, RocketChat.callbacks.priority.LOW);                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/forwardUnclosedLivechats.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* globals UserPresenceMonitor */                                                                                      //
                                                                                                                       //
var agentsHandler = undefined;                                                                                         // 3
var monitorAgents = false;                                                                                             // 4
var forwardChatTimeout = 60000;                                                                                        // 5
                                                                                                                       //
var onlineAgents = {                                                                                                   // 7
	users: {},                                                                                                            // 8
	queue: {},                                                                                                            // 9
                                                                                                                       //
	add: function (userId) {                                                                                              // 11
		if (this.queue[userId]) {                                                                                            // 12
			clearTimeout(this.queue[userId]);                                                                                   // 13
			delete this.queue[userId];                                                                                          // 14
		}                                                                                                                    //
		this.users[userId] = 1;                                                                                              // 16
	},                                                                                                                    //
                                                                                                                       //
	remove: function (userId, callback) {                                                                                 // 19
		var _this = this;                                                                                                    //
                                                                                                                       //
		if (this.queue[userId]) {                                                                                            // 20
			clearTimeout(this.queue[userId]);                                                                                   // 21
		}                                                                                                                    //
		this.queue[userId] = setTimeout(Meteor.bindEnvironment(function () {                                                 // 23
			callback();                                                                                                         // 24
                                                                                                                       //
			delete _this.users[userId];                                                                                         // 26
			delete _this.queue[userId];                                                                                         // 27
		}), forwardChatTimeout);                                                                                             //
	},                                                                                                                    //
                                                                                                                       //
	exists: function (userId) {                                                                                           // 31
		return !!this.users[userId];                                                                                         // 32
	}                                                                                                                     //
};                                                                                                                     //
                                                                                                                       //
RocketChat.settings.get('Livechat_forward_open_chats_timeout', function (key, value) {                                 // 36
	forwardChatTimeout = value * 1000;                                                                                    // 37
});                                                                                                                    //
                                                                                                                       //
RocketChat.settings.get('Livechat_forward_open_chats', function (key, value) {                                         // 40
	monitorAgents = value;                                                                                                // 41
	if (value) {                                                                                                          // 42
		if (!agentsHandler) {                                                                                                // 43
			agentsHandler = RocketChat.models.Users.findOnlineAgents().observeChanges({                                         // 44
				added: function (id) {                                                                                             // 45
					onlineAgents.add(id);                                                                                             // 46
				},                                                                                                                 //
				changed: function (id, fields) {                                                                                   // 48
					if (fields.statusLivechat && fields.statusLivechat === 'not-available') {                                         // 49
						onlineAgents.remove(id, function () {                                                                            // 50
							RocketChat.Livechat.forwardOpenChats(id);                                                                       // 51
						});                                                                                                              //
					} else {                                                                                                          //
						onlineAgents.add(id);                                                                                            // 54
					}                                                                                                                 //
				},                                                                                                                 //
				removed: function (id) {                                                                                           // 57
					onlineAgents.remove(id, function () {                                                                             // 58
						RocketChat.Livechat.forwardOpenChats(id);                                                                        // 59
					});                                                                                                               //
				}                                                                                                                  //
			});                                                                                                                 //
		}                                                                                                                    //
	} else if (agentsHandler) {                                                                                           //
		agentsHandler.stop();                                                                                                // 65
		agentsHandler = null;                                                                                                // 66
	}                                                                                                                     //
});                                                                                                                    //
                                                                                                                       //
UserPresenceMonitor.onSetUserStatus(function (user, status, statusConnection) {                                        // 70
	if (!monitorAgents) {                                                                                                 // 71
		return;                                                                                                              // 72
	}                                                                                                                     //
	if (onlineAgents.exists(user._id)) {                                                                                  // 74
		if (statusConnection === 'offline' || user.statusLivechat === 'not-available') {                                     // 75
			onlineAgents.remove(user._id, function () {                                                                         // 76
				RocketChat.Livechat.forwardOpenChats(user._id);                                                                    // 77
			});                                                                                                                 //
		}                                                                                                                    //
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/setupWebhook.js                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* globals HTTP */                                                                                                     //
var sendOnCloseLivechat = false;                                                                                       // 2
var sendOnOfflineMessage = false;                                                                                      // 3
var webhookURL = '';                                                                                                   // 4
var secretToken = '';                                                                                                  // 5
                                                                                                                       //
RocketChat.settings.get('Livechat_webhook_on_close', function (key, value) {                                           // 7
	sendOnCloseLivechat = value;                                                                                          // 8
});                                                                                                                    //
                                                                                                                       //
RocketChat.settings.get('Livechat_webhook_on_offline_msg', function (key, value) {                                     // 11
	sendOnOfflineMessage = value;                                                                                         // 12
});                                                                                                                    //
                                                                                                                       //
RocketChat.settings.get('Livechat_webhookUrl', function (key, value) {                                                 // 15
	webhookURL = value;                                                                                                   // 16
});                                                                                                                    //
                                                                                                                       //
RocketChat.settings.get('Livechat_secret_token', function (key, value) {                                               // 19
	secretToken = value;                                                                                                  // 20
});                                                                                                                    //
                                                                                                                       //
var sendRequest = function (postData) {                                                                                // 23
	var trying = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];                                  //
                                                                                                                       //
	try {                                                                                                                 // 24
		var options = {                                                                                                      // 25
			headers: {                                                                                                          // 26
				'X-RocketChat-Livechat-Token': secretToken                                                                         // 27
			},                                                                                                                  //
			data: postData                                                                                                      // 29
		};                                                                                                                   //
		HTTP.post(webhookURL, options);                                                                                      // 31
	} catch (e) {                                                                                                         //
		RocketChat.Livechat.logger.webhook.error('Response error on ' + trying + ' try ->', e);                              // 33
		// try 10 times after 10 seconds each                                                                                //
		if (trying < 10) {                                                                                                   // 35
			RocketChat.Livechat.logger.webhook.warn('Will try again in 10 seconds ...');                                        // 36
			trying++;                                                                                                           // 37
			setTimeout(Meteor.bindEnvironment(function () {                                                                     // 38
				sendRequest(postData, trying);                                                                                     // 39
			}), 10000);                                                                                                         //
		}                                                                                                                    //
	}                                                                                                                     //
};                                                                                                                     //
                                                                                                                       //
RocketChat.callbacks.add('closeLivechat', function (room) {                                                            // 45
	if (!sendOnCloseLivechat) {                                                                                           // 46
		return room;                                                                                                         // 47
	}                                                                                                                     //
                                                                                                                       //
	var visitor = RocketChat.models.Users.findOneById(room.v._id);                                                        // 50
	var agent = RocketChat.models.Users.findOneById(room.servedBy._id);                                                   // 51
                                                                                                                       //
	var ua = new UAParser();                                                                                              // 53
	ua.setUA(visitor.userAgent);                                                                                          // 54
                                                                                                                       //
	var postData = {                                                                                                      // 56
		type: 'LivechatSession',                                                                                             // 57
		_id: room._id,                                                                                                       // 58
		label: room.label,                                                                                                   // 59
		topic: room.topic,                                                                                                   // 60
		code: room.code,                                                                                                     // 61
		createdAt: room.ts,                                                                                                  // 62
		lastMessageAt: room.lm,                                                                                              // 63
		tags: room.tags,                                                                                                     // 64
		customFields: room.livechatData,                                                                                     // 65
		visitor: {                                                                                                           // 66
			_id: visitor._id,                                                                                                   // 67
			name: visitor.name,                                                                                                 // 68
			username: visitor.username,                                                                                         // 69
			email: null,                                                                                                        // 70
			phone: null,                                                                                                        // 71
			department: visitor.department,                                                                                     // 72
			ip: visitor.ip,                                                                                                     // 73
			os: ua.getOS().name && ua.getOS().name + ' ' + ua.getOS().version,                                                  // 74
			browser: ua.getBrowser().name && ua.getBrowser().name + ' ' + ua.getBrowser().version,                              // 75
			customFields: visitor.livechatData                                                                                  // 76
		},                                                                                                                   //
		agent: {                                                                                                             // 78
			_id: agent._id,                                                                                                     // 79
			username: agent.username,                                                                                           // 80
			name: agent.name,                                                                                                   // 81
			email: null                                                                                                         // 82
		},                                                                                                                   //
		messages: []                                                                                                         // 84
	};                                                                                                                    //
                                                                                                                       //
	if (visitor.emails && visitor.emails.length > 0) {                                                                    // 87
		postData.visitor.email = visitor.emails[0].address;                                                                  // 88
	}                                                                                                                     //
	if (visitor.phone && visitor.phone.length > 0) {                                                                      // 90
		postData.visitor.phone = visitor.phone[0].phoneNumber;                                                               // 91
	}                                                                                                                     //
                                                                                                                       //
	if (agent.emails && agent.emails.length > 0) {                                                                        // 94
		postData.agent.email = agent.emails[0].address;                                                                      // 95
	}                                                                                                                     //
                                                                                                                       //
	RocketChat.models.Messages.findVisibleByRoomId(room._id, { sort: { ts: 1 } }).forEach(function (message) {            // 98
		if (message.t) {                                                                                                     // 99
			return;                                                                                                             // 100
		}                                                                                                                    //
		var msg = {                                                                                                          // 102
			username: message.u.username,                                                                                       // 103
			msg: message.msg,                                                                                                   // 104
			ts: message.ts                                                                                                      // 105
		};                                                                                                                   //
                                                                                                                       //
		if (message.u.username !== visitor.username) {                                                                       // 108
			msg.agentId = message.u._id;                                                                                        // 109
		}                                                                                                                    //
		postData.messages.push(msg);                                                                                         // 111
	});                                                                                                                   //
                                                                                                                       //
	sendRequest(postData);                                                                                                // 114
});                                                                                                                    //
                                                                                                                       //
RocketChat.callbacks.add('sendOfflineLivechatMessage', function (data) {                                               // 117
	if (!sendOnOfflineMessage) {                                                                                          // 118
		return data;                                                                                                         // 119
	}                                                                                                                     //
                                                                                                                       //
	var postData = {                                                                                                      // 122
		type: 'LivechatOfflineMessage',                                                                                      // 123
		sentAt: new Date(),                                                                                                  // 124
		visitor: {                                                                                                           // 125
			name: data.name,                                                                                                    // 126
			email: data.email                                                                                                   // 127
		},                                                                                                                   //
		message: data.message                                                                                                // 129
	};                                                                                                                    //
                                                                                                                       //
	sendRequest(postData);                                                                                                // 132
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/customFields.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:customFields', function (_id) {                                                               // 1
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:customFields' }));
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-l-room')) {                                                    // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:customFields' }));
	}                                                                                                                     //
                                                                                                                       //
	if (s.trim(_id)) {                                                                                                    // 10
		return RocketChat.models.LivechatCustomField.find({ _id: _id });                                                     // 11
	}                                                                                                                     //
                                                                                                                       //
	return RocketChat.models.LivechatCustomField.find();                                                                  // 14
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/departmentAgents.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:departmentAgents', function (departmentId) {                                                  // 1
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:departmentAgents' }));
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {                                            // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:departmentAgents' }));
	}                                                                                                                     //
                                                                                                                       //
	return RocketChat.models.LivechatDepartmentAgents.find({ departmentId: departmentId });                               // 10
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/externalMessages.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:externalMessages', function (roomId) {                                                        // 1
	return RocketChat.models.LivechatExternalMessage.findByRoomId(roomId);                                                // 2
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/livechatAgents.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:agents', function () {                                                                        // 1
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:agents' }));       // 3
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {                                            // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:agents' }));       // 7
	}                                                                                                                     //
                                                                                                                       //
	var self = this;                                                                                                      // 10
                                                                                                                       //
	var handle = RocketChat.authz.getUsersInRole('livechat-agent').observeChanges({                                       // 12
		added: function (id, fields) {                                                                                       // 13
			self.added('agentUsers', id, fields);                                                                               // 14
		},                                                                                                                   //
		changed: function (id, fields) {                                                                                     // 16
			self.changed('agentUsers', id, fields);                                                                             // 17
		},                                                                                                                   //
		removed: function (id) {                                                                                             // 19
			self.removed('agentUsers', id);                                                                                     // 20
		}                                                                                                                    //
	});                                                                                                                   //
                                                                                                                       //
	self.ready();                                                                                                         // 24
                                                                                                                       //
	self.onStop(function () {                                                                                             // 26
		handle.stop();                                                                                                       // 27
	});                                                                                                                   //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/livechatDepartments.js                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:departments', function (_id) {                                                                // 1
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:agents' }));       // 3
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {                                            // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:agents' }));       // 7
	}                                                                                                                     //
                                                                                                                       //
	if (_id !== undefined) {                                                                                              // 10
		return RocketChat.models.LivechatDepartment.findByDepartmentId(_id);                                                 // 11
	} else {                                                                                                              //
		return RocketChat.models.LivechatDepartment.find();                                                                  // 13
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/livechatManagers.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:managers', function () {                                                                      // 1
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:managers' }));     // 3
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {                                            // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:managers' }));     // 7
	}                                                                                                                     //
                                                                                                                       //
	var self = this;                                                                                                      // 10
                                                                                                                       //
	var handle = RocketChat.authz.getUsersInRole('livechat-manager').observeChanges({                                     // 12
		added: function (id, fields) {                                                                                       // 13
			self.added('managerUsers', id, fields);                                                                             // 14
		},                                                                                                                   //
		changed: function (id, fields) {                                                                                     // 16
			self.changed('managerUsers', id, fields);                                                                           // 17
		},                                                                                                                   //
		removed: function (id) {                                                                                             // 19
			self.removed('managerUsers', id);                                                                                   // 20
		}                                                                                                                    //
	});                                                                                                                   //
                                                                                                                       //
	self.ready();                                                                                                         // 24
                                                                                                                       //
	self.onStop(function () {                                                                                             // 26
		handle.stop();                                                                                                       // 27
	});                                                                                                                   //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/livechatRooms.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:rooms', function () {                                                                         // 1
	var offset = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];                                  //
	var limit = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];                                  //
                                                                                                                       //
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:rooms' }));        // 3
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-livechat-rooms')) {                                            // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:rooms' }));        // 7
	}                                                                                                                     //
                                                                                                                       //
	return RocketChat.models.Rooms.findLivechat(offset, limit);                                                           // 10
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/visitorHistory.js                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:visitorHistory', function (_ref) {                                                            // 1
	var roomId = _ref.rid;                                                                                                //
                                                                                                                       //
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:visitorHistory' }));
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-l-room')) {                                                    // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:visitorHistory' }));
	}                                                                                                                     //
                                                                                                                       //
	var room = RocketChat.models.Rooms.findOneById(roomId);                                                               // 10
                                                                                                                       //
	var user = RocketChat.models.Users.findOneById(this.userId);                                                          // 12
                                                                                                                       //
	if (room.usernames.indexOf(user.username) === -1) {                                                                   // 14
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:visitorHistory' }));
	}                                                                                                                     //
                                                                                                                       //
	if (room && room.v && room.v._id) {                                                                                   // 18
		return RocketChat.models.Rooms.findByVisitorId(room.v._id);                                                          // 19
	} else {                                                                                                              //
		return this.ready();                                                                                                 // 21
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/visitorInfo.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:visitorInfo', function (_ref) {                                                               // 1
	var roomId = _ref.rid;                                                                                                //
                                                                                                                       //
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:visitorInfo' }));  // 3
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-l-room')) {                                                    // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:visitorInfo' }));  // 7
	}                                                                                                                     //
                                                                                                                       //
	var room = RocketChat.models.Rooms.findOneById(roomId);                                                               // 10
                                                                                                                       //
	if (room && room.v && room.v._id) {                                                                                   // 12
		return RocketChat.models.Users.findById(room.v._id);                                                                 // 13
	} else {                                                                                                              //
		return this.ready();                                                                                                 // 15
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/publications/visitorPageVisited.js                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish('livechat:visitorPageVisited', function (_ref) {                                                        // 1
	var roomId = _ref.rid;                                                                                                //
                                                                                                                       //
	if (!this.userId) {                                                                                                   // 2
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:visitorPageVisited' }));
	}                                                                                                                     //
                                                                                                                       //
	if (!RocketChat.authz.hasPermission(this.userId, 'view-l-room')) {                                                    // 6
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:visitorPageVisited' }));
	}                                                                                                                     //
                                                                                                                       //
	var room = RocketChat.models.Rooms.findOneById(roomId);                                                               // 10
                                                                                                                       //
	if (room && room.v && room.v.token) {                                                                                 // 12
		return RocketChat.models.LivechatPageVisited.findByToken(room.v.token);                                              // 13
	} else {                                                                                                              //
		return this.ready();                                                                                                 // 15
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_livechat/server/api.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/* globals Restivus */                                                                                                 //
var Api = new Restivus({                                                                                               // 2
	apiPath: 'livechat-api/',                                                                                             // 3
	useDefaultAuth: true,                                                                                                 // 4
	prettyJson: true                                                                                                      // 5
});                                                                                                                    //
                                                                                                                       //
Api.addRoute('sms-incoming/:service', {                                                                                // 8
	post: function () {                                                                                                   // 9
		var SMSService = RocketChat.SMS.getService(this.urlParams.service);                                                  // 10
                                                                                                                       //
		var sms = SMSService.parse(this.bodyParams);                                                                         // 12
                                                                                                                       //
		var visitor = RocketChat.models.Users.findOneVisitorByPhone(sms.from);                                               // 14
                                                                                                                       //
		var sendMessage = {                                                                                                  // 16
			message: {                                                                                                          // 17
				_id: Random.id()                                                                                                   // 18
			},                                                                                                                  //
			roomInfo: {                                                                                                         // 20
				sms: {                                                                                                             // 21
					from: sms.to                                                                                                      // 22
				}                                                                                                                  //
			}                                                                                                                   //
		};                                                                                                                   //
                                                                                                                       //
		if (visitor) {                                                                                                       // 27
			var rooms = RocketChat.models.Rooms.findOpenByVisitorToken(visitor.profile.token).fetch();                          // 28
                                                                                                                       //
			if (rooms && rooms.length > 0) {                                                                                    // 30
				sendMessage.message.rid = rooms[0]._id;                                                                            // 31
			} else {                                                                                                            //
				sendMessage.message.rid = Random.id();                                                                             // 33
			}                                                                                                                   //
			sendMessage.message.token = visitor.profile.token;                                                                  // 35
		} else {                                                                                                             //
			sendMessage.message.rid = Random.id();                                                                              // 37
			sendMessage.message.token = Random.id();                                                                            // 38
                                                                                                                       //
			var userId = RocketChat.Livechat.registerGuest({                                                                    // 40
				username: sms.from.replace(/[^0-9]/g, ''),                                                                         // 41
				token: sendMessage.message.token,                                                                                  // 42
				phone: {                                                                                                           // 43
					number: sms.from                                                                                                  // 44
				}                                                                                                                  //
			});                                                                                                                 //
                                                                                                                       //
			visitor = RocketChat.models.Users.findOneById(userId);                                                              // 48
		}                                                                                                                    //
                                                                                                                       //
		sendMessage.message.msg = sms.body;                                                                                  // 51
                                                                                                                       //
		sendMessage.guest = visitor;                                                                                         // 53
                                                                                                                       //
		var message = SMSService.response.call(this, RocketChat.Livechat.sendMessage(sendMessage));                          // 55
                                                                                                                       //
		Meteor.defer(function () {                                                                                           // 57
			if (sms.extra) {                                                                                                    // 58
				if (sms.extra.fromCountry) {                                                                                       // 59
					Meteor.call('livechat:setCustomField', sendMessage.message.token, 'country', sms.extra.fromCountry);              // 60
				}                                                                                                                  //
				if (sms.extra.fromState) {                                                                                         // 62
					Meteor.call('livechat:setCustomField', sendMessage.message.token, 'state', sms.extra.fromState);                  // 63
				}                                                                                                                  //
				if (sms.extra.fromCity) {                                                                                          // 65
					Meteor.call('livechat:setCustomField', sendMessage.message.token, 'city', sms.extra.fromCity);                    // 66
				}                                                                                                                  //
			}                                                                                                                   //
		});                                                                                                                  //
                                                                                                                       //
		return message;                                                                                                      // 71
	}                                                                                                                     //
});                                                                                                                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['rocketchat:livechat'] = {};

})();

//# sourceMappingURL=rocketchat_livechat.js.map
