var path = require('path'),
	plist = require('plist'),
	execFile = require('child_process').execFile,
	authorize = require('./build/Release/hdiutil.node').authorize;

function forAsync(iterator, begin, end, step) {

	if (arguments.length < 3) end = Infinity;

	if (!begin) begin = 0;
	if (!step) step = 1;

	var calls = 0,
		idle = true,

		it = function() {
			calls += 1;
			if (idle) {
				idle = false;

				while (calls > 0) {
					calls -= 1;

					iterator((it.iteration += step) <= end ? it : null, it.iteration);

				}

				idle = true;
			}
		};

	it.iteration = -step + begin;


	it();
}

function requestPassword(prompt, ret) {
	if (typeof prompt !== 'string') prompt = String(prompt);
	if (typeof ret !== 'function') ret = function(){};
	authorize(prompt, ret);
}

function info(path, ret) {
	if (typeof path !== 'string') path = String(path);
	if (typeof ret !== 'function') ret = function(){};
	execFile('/usr/bin/hdiutil', ['info', '-plist'], function(error, result) {
		if (!error && (result = plist.parse(result).images.filter(image => image['image-path'] === path)[0]) &&
			(result = result['system-entities'].filter(entity => !!entity['mount-point'])[0])) {
			ret(null, result['mount-point'], result['dev-entry']);
		} else ret(error);
	});
}

function isEncrypted(path, ret) {
	if (typeof path !== 'string') path = String(path);
	if (typeof ret !== 'function') ret = function(){};
	execFile('/usr/bin/hdiutil', ['isencrypted', path, '-plist'], function(error, result) {
		ret(error, !error && plist.parse(result).encrypted);
	});
}

function attach(path, ret, options) {
	if (typeof path !== 'string') path = String(path);
	if (typeof ret !== 'function') ret = function(){};
	if (typeof options !== 'object') options = {};
	info(path, function(error, mountPath, devicePath) {
		if (error || mountPath) return ret(error);
		isEncrypted(path, function(error, encrypted) {
			if (error) return ret(error);

			var prompt = options.prompt,
				password = options.password,
				args = ['attach', path, '-plist', '-stdinpass'],
				repeatTimes = (encrypted && typeof password !== 'string' && options.repeat);

			if (typeof prompt !== 'string') prompt = 'Enter password to access ' + path.basename(path);
			if (typeof repeatTimes !== 'number' || isNaN(repeatTimes) || repeatTimes < 0 || repeatTimes % 1) repeatTimes = 0;

			if (options.readonly) args.push('-readonly');
			if (options.nobrowse) args.push('-nobrowse');
			args.push(options.autoopen ? '-autoopen' : '-noautoopen');

			forAsync(function(repeat) {

				var proc = execFile('/usr/bin/hdiutil', args, function(error, result, errorMsg) {
					if (repeatTimes > repeat.iteration && errorMsg.indexOf('Authentication error') !== -1) repeat();
					else if (error) ret(error);
					else ret(null);
				}), stdin = proc.stdin;

				if (encrypted) {
					stdin.setEncoding('UTF-8');
					if (typeof password === 'string') stdin.write(password), stdin.end();
					else requestPassword(prompt, function(password, cancelled) {
						if (cancelled) proc.kill('SIGINT');
						else stdin.write(password), stdin.end();
					});
				}

			}, 0, Infinity);
		});
	});
}

function detach(path, ret, force) {
	if (typeof path !== 'string') path = String(path);
	if (typeof ret !== 'function') ret = function(){};
	info(path, function(error, mountPath, devicePath) {
		if (error || !devicePath) return ret(error);
		var args = ['detach', devicePath];
		if (force) args.push('-force');
		execFile('/usr/bin/hdiutil', args, ret);
	});
}

module.exports = {
	info: info,
	attach: attach,
	detach: detach
};