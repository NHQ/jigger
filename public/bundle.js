(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/johnny/projects/chronotrigger/entry.js":[function(require,module,exports){
context = (AudioContext) ? AudioContext : webkitAudioContext
master = new context
SAMPLERATE = samplerate = master.sampleRate
jsynth = require('jsynth')
nvelope = require('nvelope')
sync = require('jsynth-sync')
oz = require('oscillators')
jdelay = require('jdelay')
amod = require('amod')
chronotrigger  = require('./')
generator = new chronotrigger()

music = function(time, sample, input){
  timer.tick.call(timer, time)
  return generator.tick(time, sample, input)
}

timer = sync(72, master.sampleRate)

gong = timer.on(1/4, function(_t, b){
  var attack = [[0,0],[2,1],[1,1]]
  var release= [[1,1],[0,0], [1,0]]
  var curves = [attack, release]
  var durs = [.01, .06]
  var mods = {curves: curves, durations: durs}
  var synth = function(t,s,i){
    return (oz.triangle(t, 1200) + oz.saw(t, Math.random())) * (1 + (b%2%4))
  }
  var gen = generator.set(_t, synth, mods)
})

dsp = function(t, s, i){
	time = t
  return music(t, s, i)
}
synth = jsynth(master, music)
synth.connect(master.destination)

},{"./":"/home/johnny/projects/chronotrigger/index.js","amod":"/home/johnny/projects/chronotrigger/node_modules/amod/index.js","jdelay":"/home/johnny/projects/chronotrigger/node_modules/jdelay/delay.js","jsynth":"/home/johnny/projects/chronotrigger/node_modules/jsynth/index.js","jsynth-sync":"/home/johnny/projects/chronotrigger/node_modules/jsynth-sync/index.js","nvelope":"/home/johnny/projects/chronotrigger/node_modules/nvelope/index.js","oscillators":"/home/johnny/projects/chronotrigger/node_modules/oscillators/oscillators.js"}],"/home/johnny/projects/chronotrigger/index.js":[function(require,module,exports){
var nvelope = require('nvelope')


module.exports = chrono

function chrono(_time){
  if(!(this instanceof chrono)) return new chrono(_t)
  var self = this
  this.ret = {}
  this.gens = []
  this.time = _time || 0
  this.start = _time || 0

  this.set = function(time, synth, mods){
    var x;
    self.gens.push(x = new generate(time, synth, mods))
    return x
  }
  this.tick = function(t, s, i){
    self.time = t
    gc(t)
    return self.gens.reduce(function(a,e){
    	return a + e.signal(t, s, i)
    },0)
  }
  
  function gc(t){
    self.gens = self.gens.filter(function(e){
      if(e.start + e.dur < t) return false
      else return true 
    })
  }
}

function generate(_time, synth, mod){
  if(!(this instanceof generate)) return new generate(_time, synth, mod)
  var self = this
  this.start = _time
  this.dur = mod.durations.reduce(function(acc, e){
  	return acc + e
  },0)
  this.synth = synth
  this.env = nvelope(mod.curves, mod.durations)
  this.signal = function(t, s, i){
  	return self.synth(t, s, i) * self.env(t - self.start)
  }
}

},{"nvelope":"/home/johnny/projects/chronotrigger/node_modules/nvelope/index.js"}],"/home/johnny/projects/chronotrigger/node_modules/amod/index.js":[function(require,module,exports){
var oz = require('oscillators');

module.exports = function(c, r, t, f){
    return (c + (r * oz.sine(t, f)))
};

/*
@center
@radius
@time
@frequency
*/

},{"oscillators":"/home/johnny/projects/chronotrigger/node_modules/oscillators/oscillators.js"}],"/home/johnny/projects/chronotrigger/node_modules/jdelay/delay.js":[function(require,module,exports){
var  funstance = require('funstance');

module.exports = function(delay, feedback, mix, bufferSize){
		
  var delay = Math.floor(delay)

  var feedback = feedback

  var mix = mix

  var bufferSize = bufferSize || delay * 2;

  if(bufferSize < delay * 2) bufferSize = delay * 2

  var d = new Delay(delay, feedback, mix, bufferSize)

  var fn = funstance(d, Sample)

  return fn

  function Delay(delay, feedback, mix, bufferSize){
			
	  this.feedback = feedback;
	
	  this.mix = mix;
	
	  this.delay = delay;

	  this.buffer = new Float32Array(bufferSize);
	
	  this.writeOffset = 0;

	  this.endPoint = (this.delay * 2)
		
	  this.readOffset = this.delay + 1

          this.readZero = 0;
	
 	};


  function Sample(sample, _delay, feedback, mix){

      var s = sample;

      if(feedback) this.feedback = feedback;

      if(mix) this.mix = mix;

      if(_delay && _delay !== this.delay){

	  _delay = Math.max(0, Math.floor(_delay));
	  
	  if(_delay * 2 > this.buffer.length) {

	      var nb = new Float32Array(_delay*3.5);

	      nb.set(this.buffer, 0);

	      this.buffer = nb		

  	  }

//	  if(_delay > this.delay) this.readZero = _delay - this.delay;
	  
	  this.delay = _delay;
	  
	  this.endPoint = (this.delay * 2);

      }
      
    if (this.readOffset >= this.endPoint) this.readOffset = 0;

    sample += (this.readZero-- > 0) ? 0 : (this.buffer[this.readOffset] * this.mix);

    var write = s + (sample * this.feedback);

    this.buffer[this.writeOffset] = write

    this.writeOffset++;

    this.readOffset++;

    if (this.writeOffset >= this.endPoint) this.writeOffset = 0;

    return isNaN(sample) ? Math.random() : sample

  };

};

},{"funstance":"/home/johnny/projects/chronotrigger/node_modules/jdelay/node_modules/funstance/index.js"}],"/home/johnny/projects/chronotrigger/node_modules/jdelay/node_modules/funstance/index.js":[function(require,module,exports){
module.exports = function (obj, fn) {
    var f = function () {
        if (typeof fn !== 'function') return;
        return fn.apply(obj, arguments);
    };
    
    function C () {}
    C.prototype = Object.getPrototypeOf(obj);
    f.__proto__ = new C;
    
    Object.getOwnPropertyNames(Function.prototype).forEach(function (key) {
        if (f[key] === undefined) {
            f.__proto__[key] = Function.prototype[key];
        }
    });
    
    Object.getOwnPropertyNames(obj).forEach(function (key) {
        f[key] = obj[key];
    });
    
    return f;
};

},{}],"/home/johnny/projects/chronotrigger/node_modules/jsynth-sync/index.js":[function(require,module,exports){
module.exports = sync
var $ = module.exports.prototype

function sync(bpm, sampleRate){ // bpm, sampleRate, 

	if(!(this instanceof sync)) return new sync(bpm, sampleRate)

	this.bpm = bpm
	this.beatsPerSecond = bpm / 60
	this.sampleRate = sampleRate
	this.spb = Math.round(sampleRate / this.beatsPerSecond)
	this.s = 0
	this.t = 0
	this.index = []
	this.beatIndex = new Array()
	return this
}

$.clearAll = function(bpm, samplerate){
	this.index = this.index.map(function(){return undefined})
}

$.tick = function(t, i){
	this.s++
	if(!t) t = this.s / this.sampleRate
//	var f = (this.s % this.spb) + 1;
	for(var n = 0; n < this.index.length; n++ ){
		if(this.index[n]) this.index[n](t, i, this.s)
	}
}

$.off = function(i){
	this.index.splice(i,1,undefined)
}

$.on = function(beats, fn){
	var i = Math.floor(this.spb * beats);
	var l = this.index.length;
	if(!(this.beatIndex[i])) this.beatIndex[i] = 0;
	var self = this;
	var off = function(){self.off(l)};
	this.index.push(function(t, a, f){
		if(f % i == 0) {
			fn.apply(fn, [t, ++self.beatIndex[i], off])
		}
	})
	return off

}

function amilli(t){
	return [Math.floor(t), (t % 1) * 1000]
}

},{}],"/home/johnny/projects/chronotrigger/node_modules/jsynth/index.js":[function(require,module,exports){
module.exports = function (context, fn, bufSize) {

    if (typeof context === 'function') {
      fn = context;
      context = new webkitAudioContext() ;
    }

    if(!bufSize) bufSize = 4096;

    var self = context.createScriptProcessor(bufSize, 1, 1);

    self.fn = fn

    self.i = self.t = 0

    window._SAMPLERATE = self.sampleRate = self.rate = context.sampleRate;

    self.duration = Infinity;

    self.recording = false;

    self.onaudioprocess = function(e){
      var output = e.outputBuffer.getChannelData(0)
      ,   input = e.inputBuffer.getChannelData(0);
      self.tick(output, input);
    };

    self._input = []
    
    self.tick = function (output, input) { // a fill-a-buffer function

      output = output || self._buffer;

      input = input || self._input

      for (var i = 0; i < output.length; i += 1) {

          self.t = self.i / self.rate;

          self.i += 1;

          output[i] = self.fn(self.t, self.i, input);

          if(self.i >= self.duration) {
            self.stop()
            break;
          }

      }

      return output
      
    };

    self.stop = function(){
    
      self.disconnect();

      self.playing = false;

      if(self.recording) {}
    };

    self.play = function(opts){

      if (self.playing) return;

      self.connect(self.context.destination);

      self.playing = true;

      return
    
    };

    self.record = function(){

    };

    self.reset = function(){
      self.i = self.t = 0
    };

    self.createSample = function(duration){
      self.reset();
      var buffer = self.context.createBuffer(1, duration, self.context.sampleRate)
      var blob = buffer.getChannelData(0);
      self.tick(blob);
      return buffer
    };

    return self;
};

function mergeArgs (opts, args) {
    Object.keys(opts || {}).forEach(function (key) {
        args[key] = opts[key];
    });

    return Object.keys(args).reduce(function (acc, key) {
        var dash = key.length === 1 ? '-' : '--';
        return acc.concat(dash + key, args[key]);
    }, []);
}

function signed (n) {
    if (isNaN(n)) return 0;
    var b = Math.pow(2, 15);
    return n > 0
        ? Math.min(b - 1, Math.floor((b * n) - 1))
        : Math.max(-b, Math.ceil((b * n) - 1))
    ;
}

},{}],"/home/johnny/projects/chronotrigger/node_modules/nvelope/amod.js":[function(require,module,exports){
module.exports = function (pts) {
        return function (t) {
                for (var a = pts; a.length > 1; a = b){
                        for (var i = 0, b = [], j; i < a.length - 1; i++){
                                for (b[i] = [], j = 1; j < a[i].length; j++){
                                        b[i][j] = a[i][j] * (1 - t) + a[i+1][j] * t;
                                }
                        }
                }
                return a[0][1];
	}    
}



},{}],"/home/johnny/projects/chronotrigger/node_modules/nvelope/index.js":[function(require,module,exports){
var amod = require( './amod.js');
var tnorm = require('normalize-time');

module.exports = function(pts, durs){
	
	pts = pts.map(amod)
	var t = 0;
	var totalDuration = durs.reduce(function(e,i){return e + i}, 0);
	var tdNormFN = tnorm(t, totalDuration);
	var s = 0;
	var end = t + totalDuration;
	var durFNS = durs.map(function(e,i){
		var x = tnorm(t + s, e)
		s += e;
		return x
	})
	var dp = 0;
	var durpercent = durs.map(function(e, i){
		var x = (e / totalDuration) + dp;
		dp+= (e / totalDuration)
		return x
	})
	var tn, n, i, v = 0, fn = 0;
	var envelope = function(t){
		tn = tdNormFN(t);
		if(0 > tn || tn > 1) return 0;
		fn = durpercent.reduce(function(p, e, i, d){return ((d[i-1] || 0) <= tn && tn <= e) ? i : p}, 0)
		v = pts[fn](durFNS[fn](t))
		return v
	}
	return envelope

	// probably deletable
	function xenvelope(t, sustain){
		tn = tdNormFN(t); 
		if(0 >= tn || tn  >= 1) return 0;
		if(tn > durpercent[fn]) fn = (fn + 1 > pts.length - 1 ? 0 : fn + 1)
		v = pts[fn](durFNS[fn](t))
		return v
	}
}


},{"./amod.js":"/home/johnny/projects/chronotrigger/node_modules/nvelope/amod.js","normalize-time":"/home/johnny/projects/chronotrigger/node_modules/nvelope/node_modules/normalize-time/index.js"}],"/home/johnny/projects/chronotrigger/node_modules/nvelope/node_modules/normalize-time/index.js":[function(require,module,exports){
module.exports = function(start, dur, min, max){

	if(!min) min = 0;
	if(!max) max = 1;
	var end = start + dur;
	var d = end - start;
	var r = max - min;

	return function(time){

		x = min + (time - start) * r / d
		if(x > 1){
//			console.log('pre', time, end)
			if(time < end) x = Number('.' + x.toString().split('.').join(''))
//			console.log('norm', x)
		}
		return x
	}

}

},{}],"/home/johnny/projects/chronotrigger/node_modules/oscillators/oscillators.js":[function(require,module,exports){
var OZ = module.exports
var tau = Math.PI * 2

OZ.sine = sine;
OZ.saw = saw;
OZ.saw_i = saw_i;
OZ.triangle = triangle;
OZ.triangle_s = triangle_s;
OZ.square = square;

function sine(t, f){

    return Math.sin(t * tau * f);
    
};

function saw(t, f){

    var n = ((t % (1/f)) * f) % 1; // n = [0 -> 1]

    return -1 + (2 * n)

};

function saw_i(t, f){

    var n = ((t % (1/f)) * f) % 1; // n = [0 -> 1]
    
    return 1 - (2 * n)

};

function triangle(t, f){
    
    var n = ((t % (1/f)) * f) % 1; // n = [0 -> 1]
    
    return n < 0.5 ? -1 + (2 * (2 * n)) : 1 - (2 * (2 * n))
    
};

function triangle_s(t, f){
    
    var n = ((t % (1/f)) * f) % 1; // n = [0 -> 1]
    
    var s = Math.abs(Math.sin(t));
    
    return n < s ? -1 + (2 * (2 * (n / s))) : 1 - (2 * (2 * (n / s)))
    
};

function square(t, f){

    return ((t % (1/f)) * f) % 1 > 0.5 ? 1 : -1;

};

},{}]},{},["/home/johnny/projects/chronotrigger/entry.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9qb2hubnkvcHJvamVjdHMvY2hyb25vdHJpZ2dlci9lbnRyeS5qcyIsIi9ob21lL2pvaG5ueS9wcm9qZWN0cy9jaHJvbm90cmlnZ2VyL2luZGV4LmpzIiwiL2hvbWUvam9obm55L3Byb2plY3RzL2Nocm9ub3RyaWdnZXIvbm9kZV9tb2R1bGVzL2Ftb2QvaW5kZXguanMiLCIvaG9tZS9qb2hubnkvcHJvamVjdHMvY2hyb25vdHJpZ2dlci9ub2RlX21vZHVsZXMvamRlbGF5L2RlbGF5LmpzIiwiL2hvbWUvam9obm55L3Byb2plY3RzL2Nocm9ub3RyaWdnZXIvbm9kZV9tb2R1bGVzL2pkZWxheS9ub2RlX21vZHVsZXMvZnVuc3RhbmNlL2luZGV4LmpzIiwiL2hvbWUvam9obm55L3Byb2plY3RzL2Nocm9ub3RyaWdnZXIvbm9kZV9tb2R1bGVzL2pzeW50aC1zeW5jL2luZGV4LmpzIiwiL2hvbWUvam9obm55L3Byb2plY3RzL2Nocm9ub3RyaWdnZXIvbm9kZV9tb2R1bGVzL2pzeW50aC9pbmRleC5qcyIsIi9ob21lL2pvaG5ueS9wcm9qZWN0cy9jaHJvbm90cmlnZ2VyL25vZGVfbW9kdWxlcy9udmVsb3BlL2Ftb2QuanMiLCIvaG9tZS9qb2hubnkvcHJvamVjdHMvY2hyb25vdHJpZ2dlci9ub2RlX21vZHVsZXMvbnZlbG9wZS9pbmRleC5qcyIsIi9ob21lL2pvaG5ueS9wcm9qZWN0cy9jaHJvbm90cmlnZ2VyL25vZGVfbW9kdWxlcy9udmVsb3BlL25vZGVfbW9kdWxlcy9ub3JtYWxpemUtdGltZS9pbmRleC5qcyIsIi9ob21lL2pvaG5ueS9wcm9qZWN0cy9jaHJvbm90cmlnZ2VyL25vZGVfbW9kdWxlcy9vc2NpbGxhdG9ycy9vc2NpbGxhdG9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb250ZXh0ID0gKEF1ZGlvQ29udGV4dCkgPyBBdWRpb0NvbnRleHQgOiB3ZWJraXRBdWRpb0NvbnRleHRcbm1hc3RlciA9IG5ldyBjb250ZXh0XG5TQU1QTEVSQVRFID0gc2FtcGxlcmF0ZSA9IG1hc3Rlci5zYW1wbGVSYXRlXG5qc3ludGggPSByZXF1aXJlKCdqc3ludGgnKVxubnZlbG9wZSA9IHJlcXVpcmUoJ252ZWxvcGUnKVxuc3luYyA9IHJlcXVpcmUoJ2pzeW50aC1zeW5jJylcbm96ID0gcmVxdWlyZSgnb3NjaWxsYXRvcnMnKVxuamRlbGF5ID0gcmVxdWlyZSgnamRlbGF5JylcbmFtb2QgPSByZXF1aXJlKCdhbW9kJylcbmNocm9ub3RyaWdnZXIgID0gcmVxdWlyZSgnLi8nKVxuZ2VuZXJhdG9yID0gbmV3IGNocm9ub3RyaWdnZXIoKVxuXG5tdXNpYyA9IGZ1bmN0aW9uKHRpbWUsIHNhbXBsZSwgaW5wdXQpe1xuICB0aW1lci50aWNrLmNhbGwodGltZXIsIHRpbWUpXG4gIHJldHVybiBnZW5lcmF0b3IudGljayh0aW1lLCBzYW1wbGUsIGlucHV0KVxufVxuXG50aW1lciA9IHN5bmMoNzIsIG1hc3Rlci5zYW1wbGVSYXRlKVxuXG5nb25nID0gdGltZXIub24oMS80LCBmdW5jdGlvbihfdCwgYil7XG4gIHZhciBhdHRhY2sgPSBbWzAsMF0sWzIsMV0sWzEsMV1dXG4gIHZhciByZWxlYXNlPSBbWzEsMV0sWzAsMF0sIFsxLDBdXVxuICB2YXIgY3VydmVzID0gW2F0dGFjaywgcmVsZWFzZV1cbiAgdmFyIGR1cnMgPSBbLjAxLCAuMDZdXG4gIHZhciBtb2RzID0ge2N1cnZlczogY3VydmVzLCBkdXJhdGlvbnM6IGR1cnN9XG4gIHZhciBzeW50aCA9IGZ1bmN0aW9uKHQscyxpKXtcbiAgICByZXR1cm4gKG96LnRyaWFuZ2xlKHQsIDEyMDApICsgb3ouc2F3KHQsIE1hdGgucmFuZG9tKCkpKSAqICgxICsgKGIlMiU0KSlcbiAgfVxuICB2YXIgZ2VuID0gZ2VuZXJhdG9yLnNldChfdCwgc3ludGgsIG1vZHMpXG59KVxuXG5kc3AgPSBmdW5jdGlvbih0LCBzLCBpKXtcblx0dGltZSA9IHRcbiAgcmV0dXJuIG11c2ljKHQsIHMsIGkpXG59XG5zeW50aCA9IGpzeW50aChtYXN0ZXIsIG11c2ljKVxuc3ludGguY29ubmVjdChtYXN0ZXIuZGVzdGluYXRpb24pXG4iLCJ2YXIgbnZlbG9wZSA9IHJlcXVpcmUoJ252ZWxvcGUnKVxuXG5cbm1vZHVsZS5leHBvcnRzID0gY2hyb25vXG5cbmZ1bmN0aW9uIGNocm9ubyhfdGltZSl7XG4gIGlmKCEodGhpcyBpbnN0YW5jZW9mIGNocm9ubykpIHJldHVybiBuZXcgY2hyb25vKF90KVxuICB2YXIgc2VsZiA9IHRoaXNcbiAgdGhpcy5yZXQgPSB7fVxuICB0aGlzLmdlbnMgPSBbXVxuICB0aGlzLnRpbWUgPSBfdGltZSB8fCAwXG4gIHRoaXMuc3RhcnQgPSBfdGltZSB8fCAwXG5cbiAgdGhpcy5zZXQgPSBmdW5jdGlvbih0aW1lLCBzeW50aCwgbW9kcyl7XG4gICAgdmFyIHg7XG4gICAgc2VsZi5nZW5zLnB1c2goeCA9IG5ldyBnZW5lcmF0ZSh0aW1lLCBzeW50aCwgbW9kcykpXG4gICAgcmV0dXJuIHhcbiAgfVxuICB0aGlzLnRpY2sgPSBmdW5jdGlvbih0LCBzLCBpKXtcbiAgICBzZWxmLnRpbWUgPSB0XG4gICAgZ2ModClcbiAgICByZXR1cm4gc2VsZi5nZW5zLnJlZHVjZShmdW5jdGlvbihhLGUpe1xuICAgIFx0cmV0dXJuIGEgKyBlLnNpZ25hbCh0LCBzLCBpKVxuICAgIH0sMClcbiAgfVxuICBcbiAgZnVuY3Rpb24gZ2ModCl7XG4gICAgc2VsZi5nZW5zID0gc2VsZi5nZW5zLmZpbHRlcihmdW5jdGlvbihlKXtcbiAgICAgIGlmKGUuc3RhcnQgKyBlLmR1ciA8IHQpIHJldHVybiBmYWxzZVxuICAgICAgZWxzZSByZXR1cm4gdHJ1ZSBcbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlKF90aW1lLCBzeW50aCwgbW9kKXtcbiAgaWYoISh0aGlzIGluc3RhbmNlb2YgZ2VuZXJhdGUpKSByZXR1cm4gbmV3IGdlbmVyYXRlKF90aW1lLCBzeW50aCwgbW9kKVxuICB2YXIgc2VsZiA9IHRoaXNcbiAgdGhpcy5zdGFydCA9IF90aW1lXG4gIHRoaXMuZHVyID0gbW9kLmR1cmF0aW9ucy5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBlKXtcbiAgXHRyZXR1cm4gYWNjICsgZVxuICB9LDApXG4gIHRoaXMuc3ludGggPSBzeW50aFxuICB0aGlzLmVudiA9IG52ZWxvcGUobW9kLmN1cnZlcywgbW9kLmR1cmF0aW9ucylcbiAgdGhpcy5zaWduYWwgPSBmdW5jdGlvbih0LCBzLCBpKXtcbiAgXHRyZXR1cm4gc2VsZi5zeW50aCh0LCBzLCBpKSAqIHNlbGYuZW52KHQgLSBzZWxmLnN0YXJ0KVxuICB9XG59XG4iLCJ2YXIgb3ogPSByZXF1aXJlKCdvc2NpbGxhdG9ycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGMsIHIsIHQsIGYpe1xuICAgIHJldHVybiAoYyArIChyICogb3ouc2luZSh0LCBmKSkpXG59O1xuXG4vKlxuQGNlbnRlclxuQHJhZGl1c1xuQHRpbWVcbkBmcmVxdWVuY3lcbiovXG4iLCJ2YXIgIGZ1bnN0YW5jZSA9IHJlcXVpcmUoJ2Z1bnN0YW5jZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRlbGF5LCBmZWVkYmFjaywgbWl4LCBidWZmZXJTaXplKXtcblx0XHRcbiAgdmFyIGRlbGF5ID0gTWF0aC5mbG9vcihkZWxheSlcblxuICB2YXIgZmVlZGJhY2sgPSBmZWVkYmFja1xuXG4gIHZhciBtaXggPSBtaXhcblxuICB2YXIgYnVmZmVyU2l6ZSA9IGJ1ZmZlclNpemUgfHwgZGVsYXkgKiAyO1xuXG4gIGlmKGJ1ZmZlclNpemUgPCBkZWxheSAqIDIpIGJ1ZmZlclNpemUgPSBkZWxheSAqIDJcblxuICB2YXIgZCA9IG5ldyBEZWxheShkZWxheSwgZmVlZGJhY2ssIG1peCwgYnVmZmVyU2l6ZSlcblxuICB2YXIgZm4gPSBmdW5zdGFuY2UoZCwgU2FtcGxlKVxuXG4gIHJldHVybiBmblxuXG4gIGZ1bmN0aW9uIERlbGF5KGRlbGF5LCBmZWVkYmFjaywgbWl4LCBidWZmZXJTaXplKXtcblx0XHRcdFxuXHQgIHRoaXMuZmVlZGJhY2sgPSBmZWVkYmFjaztcblx0XG5cdCAgdGhpcy5taXggPSBtaXg7XG5cdFxuXHQgIHRoaXMuZGVsYXkgPSBkZWxheTtcblxuXHQgIHRoaXMuYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXJTaXplKTtcblx0XG5cdCAgdGhpcy53cml0ZU9mZnNldCA9IDA7XG5cblx0ICB0aGlzLmVuZFBvaW50ID0gKHRoaXMuZGVsYXkgKiAyKVxuXHRcdFxuXHQgIHRoaXMucmVhZE9mZnNldCA9IHRoaXMuZGVsYXkgKyAxXG5cbiAgICAgICAgICB0aGlzLnJlYWRaZXJvID0gMDtcblx0XG4gXHR9O1xuXG5cbiAgZnVuY3Rpb24gU2FtcGxlKHNhbXBsZSwgX2RlbGF5LCBmZWVkYmFjaywgbWl4KXtcblxuICAgICAgdmFyIHMgPSBzYW1wbGU7XG5cbiAgICAgIGlmKGZlZWRiYWNrKSB0aGlzLmZlZWRiYWNrID0gZmVlZGJhY2s7XG5cbiAgICAgIGlmKG1peCkgdGhpcy5taXggPSBtaXg7XG5cbiAgICAgIGlmKF9kZWxheSAmJiBfZGVsYXkgIT09IHRoaXMuZGVsYXkpe1xuXG5cdCAgX2RlbGF5ID0gTWF0aC5tYXgoMCwgTWF0aC5mbG9vcihfZGVsYXkpKTtcblx0ICBcblx0ICBpZihfZGVsYXkgKiAyID4gdGhpcy5idWZmZXIubGVuZ3RoKSB7XG5cblx0ICAgICAgdmFyIG5iID0gbmV3IEZsb2F0MzJBcnJheShfZGVsYXkqMy41KTtcblxuXHQgICAgICBuYi5zZXQodGhpcy5idWZmZXIsIDApO1xuXG5cdCAgICAgIHRoaXMuYnVmZmVyID0gbmJcdFx0XG5cbiAgXHQgIH1cblxuLy9cdCAgaWYoX2RlbGF5ID4gdGhpcy5kZWxheSkgdGhpcy5yZWFkWmVybyA9IF9kZWxheSAtIHRoaXMuZGVsYXk7XG5cdCAgXG5cdCAgdGhpcy5kZWxheSA9IF9kZWxheTtcblx0ICBcblx0ICB0aGlzLmVuZFBvaW50ID0gKHRoaXMuZGVsYXkgKiAyKTtcblxuICAgICAgfVxuICAgICAgXG4gICAgaWYgKHRoaXMucmVhZE9mZnNldCA+PSB0aGlzLmVuZFBvaW50KSB0aGlzLnJlYWRPZmZzZXQgPSAwO1xuXG4gICAgc2FtcGxlICs9ICh0aGlzLnJlYWRaZXJvLS0gPiAwKSA/IDAgOiAodGhpcy5idWZmZXJbdGhpcy5yZWFkT2Zmc2V0XSAqIHRoaXMubWl4KTtcblxuICAgIHZhciB3cml0ZSA9IHMgKyAoc2FtcGxlICogdGhpcy5mZWVkYmFjayk7XG5cbiAgICB0aGlzLmJ1ZmZlclt0aGlzLndyaXRlT2Zmc2V0XSA9IHdyaXRlXG5cbiAgICB0aGlzLndyaXRlT2Zmc2V0Kys7XG5cbiAgICB0aGlzLnJlYWRPZmZzZXQrKztcblxuICAgIGlmICh0aGlzLndyaXRlT2Zmc2V0ID49IHRoaXMuZW5kUG9pbnQpIHRoaXMud3JpdGVPZmZzZXQgPSAwO1xuXG4gICAgcmV0dXJuIGlzTmFOKHNhbXBsZSkgPyBNYXRoLnJhbmRvbSgpIDogc2FtcGxlXG5cbiAgfTtcblxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaiwgZm4pIHtcbiAgICB2YXIgZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgXG4gICAgZnVuY3Rpb24gQyAoKSB7fVxuICAgIEMucHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaik7XG4gICAgZi5fX3Byb3RvX18gPSBuZXcgQztcbiAgICBcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhGdW5jdGlvbi5wcm90b3R5cGUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAoZltrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGYuX19wcm90b19fW2tleV0gPSBGdW5jdGlvbi5wcm90b3R5cGVba2V5XTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIFxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGZba2V5XSA9IG9ialtrZXldO1xuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBmO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gc3luY1xudmFyICQgPSBtb2R1bGUuZXhwb3J0cy5wcm90b3R5cGVcblxuZnVuY3Rpb24gc3luYyhicG0sIHNhbXBsZVJhdGUpeyAvLyBicG0sIHNhbXBsZVJhdGUsIFxuXG5cdGlmKCEodGhpcyBpbnN0YW5jZW9mIHN5bmMpKSByZXR1cm4gbmV3IHN5bmMoYnBtLCBzYW1wbGVSYXRlKVxuXG5cdHRoaXMuYnBtID0gYnBtXG5cdHRoaXMuYmVhdHNQZXJTZWNvbmQgPSBicG0gLyA2MFxuXHR0aGlzLnNhbXBsZVJhdGUgPSBzYW1wbGVSYXRlXG5cdHRoaXMuc3BiID0gTWF0aC5yb3VuZChzYW1wbGVSYXRlIC8gdGhpcy5iZWF0c1BlclNlY29uZClcblx0dGhpcy5zID0gMFxuXHR0aGlzLnQgPSAwXG5cdHRoaXMuaW5kZXggPSBbXVxuXHR0aGlzLmJlYXRJbmRleCA9IG5ldyBBcnJheSgpXG5cdHJldHVybiB0aGlzXG59XG5cbiQuY2xlYXJBbGwgPSBmdW5jdGlvbihicG0sIHNhbXBsZXJhdGUpe1xuXHR0aGlzLmluZGV4ID0gdGhpcy5pbmRleC5tYXAoZnVuY3Rpb24oKXtyZXR1cm4gdW5kZWZpbmVkfSlcbn1cblxuJC50aWNrID0gZnVuY3Rpb24odCwgaSl7XG5cdHRoaXMucysrXG5cdGlmKCF0KSB0ID0gdGhpcy5zIC8gdGhpcy5zYW1wbGVSYXRlXG4vL1x0dmFyIGYgPSAodGhpcy5zICUgdGhpcy5zcGIpICsgMTtcblx0Zm9yKHZhciBuID0gMDsgbiA8IHRoaXMuaW5kZXgubGVuZ3RoOyBuKysgKXtcblx0XHRpZih0aGlzLmluZGV4W25dKSB0aGlzLmluZGV4W25dKHQsIGksIHRoaXMucylcblx0fVxufVxuXG4kLm9mZiA9IGZ1bmN0aW9uKGkpe1xuXHR0aGlzLmluZGV4LnNwbGljZShpLDEsdW5kZWZpbmVkKVxufVxuXG4kLm9uID0gZnVuY3Rpb24oYmVhdHMsIGZuKXtcblx0dmFyIGkgPSBNYXRoLmZsb29yKHRoaXMuc3BiICogYmVhdHMpO1xuXHR2YXIgbCA9IHRoaXMuaW5kZXgubGVuZ3RoO1xuXHRpZighKHRoaXMuYmVhdEluZGV4W2ldKSkgdGhpcy5iZWF0SW5kZXhbaV0gPSAwO1xuXHR2YXIgc2VsZiA9IHRoaXM7XG5cdHZhciBvZmYgPSBmdW5jdGlvbigpe3NlbGYub2ZmKGwpfTtcblx0dGhpcy5pbmRleC5wdXNoKGZ1bmN0aW9uKHQsIGEsIGYpe1xuXHRcdGlmKGYgJSBpID09IDApIHtcblx0XHRcdGZuLmFwcGx5KGZuLCBbdCwgKytzZWxmLmJlYXRJbmRleFtpXSwgb2ZmXSlcblx0XHR9XG5cdH0pXG5cdHJldHVybiBvZmZcblxufVxuXG5mdW5jdGlvbiBhbWlsbGkodCl7XG5cdHJldHVybiBbTWF0aC5mbG9vcih0KSwgKHQgJSAxKSAqIDEwMDBdXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjb250ZXh0LCBmbiwgYnVmU2l6ZSkge1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbiA9IGNvbnRleHQ7XG4gICAgICBjb250ZXh0ID0gbmV3IHdlYmtpdEF1ZGlvQ29udGV4dCgpIDtcbiAgICB9XG5cbiAgICBpZighYnVmU2l6ZSkgYnVmU2l6ZSA9IDQwOTY7XG5cbiAgICB2YXIgc2VsZiA9IGNvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKGJ1ZlNpemUsIDEsIDEpO1xuXG4gICAgc2VsZi5mbiA9IGZuXG5cbiAgICBzZWxmLmkgPSBzZWxmLnQgPSAwXG5cbiAgICB3aW5kb3cuX1NBTVBMRVJBVEUgPSBzZWxmLnNhbXBsZVJhdGUgPSBzZWxmLnJhdGUgPSBjb250ZXh0LnNhbXBsZVJhdGU7XG5cbiAgICBzZWxmLmR1cmF0aW9uID0gSW5maW5pdHk7XG5cbiAgICBzZWxmLnJlY29yZGluZyA9IGZhbHNlO1xuXG4gICAgc2VsZi5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyIG91dHB1dCA9IGUub3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKDApXG4gICAgICAsICAgaW5wdXQgPSBlLmlucHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKDApO1xuICAgICAgc2VsZi50aWNrKG91dHB1dCwgaW5wdXQpO1xuICAgIH07XG5cbiAgICBzZWxmLl9pbnB1dCA9IFtdXG4gICAgXG4gICAgc2VsZi50aWNrID0gZnVuY3Rpb24gKG91dHB1dCwgaW5wdXQpIHsgLy8gYSBmaWxsLWEtYnVmZmVyIGZ1bmN0aW9uXG5cbiAgICAgIG91dHB1dCA9IG91dHB1dCB8fCBzZWxmLl9idWZmZXI7XG5cbiAgICAgIGlucHV0ID0gaW5wdXQgfHwgc2VsZi5faW5wdXRcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdXRwdXQubGVuZ3RoOyBpICs9IDEpIHtcblxuICAgICAgICAgIHNlbGYudCA9IHNlbGYuaSAvIHNlbGYucmF0ZTtcblxuICAgICAgICAgIHNlbGYuaSArPSAxO1xuXG4gICAgICAgICAgb3V0cHV0W2ldID0gc2VsZi5mbihzZWxmLnQsIHNlbGYuaSwgaW5wdXQpO1xuXG4gICAgICAgICAgaWYoc2VsZi5pID49IHNlbGYuZHVyYXRpb24pIHtcbiAgICAgICAgICAgIHNlbGYuc3RvcCgpXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgICAgXG4gICAgfTtcblxuICAgIHNlbGYuc3RvcCA9IGZ1bmN0aW9uKCl7XG4gICAgXG4gICAgICBzZWxmLmRpc2Nvbm5lY3QoKTtcblxuICAgICAgc2VsZi5wbGF5aW5nID0gZmFsc2U7XG5cbiAgICAgIGlmKHNlbGYucmVjb3JkaW5nKSB7fVxuICAgIH07XG5cbiAgICBzZWxmLnBsYXkgPSBmdW5jdGlvbihvcHRzKXtcblxuICAgICAgaWYgKHNlbGYucGxheWluZykgcmV0dXJuO1xuXG4gICAgICBzZWxmLmNvbm5lY3Qoc2VsZi5jb250ZXh0LmRlc3RpbmF0aW9uKTtcblxuICAgICAgc2VsZi5wbGF5aW5nID0gdHJ1ZTtcblxuICAgICAgcmV0dXJuXG4gICAgXG4gICAgfTtcblxuICAgIHNlbGYucmVjb3JkID0gZnVuY3Rpb24oKXtcblxuICAgIH07XG5cbiAgICBzZWxmLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuaSA9IHNlbGYudCA9IDBcbiAgICB9O1xuXG4gICAgc2VsZi5jcmVhdGVTYW1wbGUgPSBmdW5jdGlvbihkdXJhdGlvbil7XG4gICAgICBzZWxmLnJlc2V0KCk7XG4gICAgICB2YXIgYnVmZmVyID0gc2VsZi5jb250ZXh0LmNyZWF0ZUJ1ZmZlcigxLCBkdXJhdGlvbiwgc2VsZi5jb250ZXh0LnNhbXBsZVJhdGUpXG4gICAgICB2YXIgYmxvYiA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTtcbiAgICAgIHNlbGYudGljayhibG9iKTtcbiAgICAgIHJldHVybiBidWZmZXJcbiAgICB9O1xuXG4gICAgcmV0dXJuIHNlbGY7XG59O1xuXG5mdW5jdGlvbiBtZXJnZUFyZ3MgKG9wdHMsIGFyZ3MpIHtcbiAgICBPYmplY3Qua2V5cyhvcHRzIHx8IHt9KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgYXJnc1trZXldID0gb3B0c1trZXldO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKGFyZ3MpLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBrZXkpIHtcbiAgICAgICAgdmFyIGRhc2ggPSBrZXkubGVuZ3RoID09PSAxID8gJy0nIDogJy0tJztcbiAgICAgICAgcmV0dXJuIGFjYy5jb25jYXQoZGFzaCArIGtleSwgYXJnc1trZXldKTtcbiAgICB9LCBbXSk7XG59XG5cbmZ1bmN0aW9uIHNpZ25lZCAobikge1xuICAgIGlmIChpc05hTihuKSkgcmV0dXJuIDA7XG4gICAgdmFyIGIgPSBNYXRoLnBvdygyLCAxNSk7XG4gICAgcmV0dXJuIG4gPiAwXG4gICAgICAgID8gTWF0aC5taW4oYiAtIDEsIE1hdGguZmxvb3IoKGIgKiBuKSAtIDEpKVxuICAgICAgICA6IE1hdGgubWF4KC1iLCBNYXRoLmNlaWwoKGIgKiBuKSAtIDEpKVxuICAgIDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHB0cykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBhID0gcHRzOyBhLmxlbmd0aCA+IDE7IGEgPSBiKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBiID0gW10sIGo7IGkgPCBhLmxlbmd0aCAtIDE7IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoYltpXSA9IFtdLCBqID0gMTsgaiA8IGFbaV0ubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJbaV1bal0gPSBhW2ldW2pdICogKDEgLSB0KSArIGFbaSsxXVtqXSAqIHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFbMF1bMV07XG5cdH0gICAgXG59XG5cblxuIiwidmFyIGFtb2QgPSByZXF1aXJlKCAnLi9hbW9kLmpzJyk7XG52YXIgdG5vcm0gPSByZXF1aXJlKCdub3JtYWxpemUtdGltZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHB0cywgZHVycyl7XG5cdFxuXHRwdHMgPSBwdHMubWFwKGFtb2QpXG5cdHZhciB0ID0gMDtcblx0dmFyIHRvdGFsRHVyYXRpb24gPSBkdXJzLnJlZHVjZShmdW5jdGlvbihlLGkpe3JldHVybiBlICsgaX0sIDApO1xuXHR2YXIgdGROb3JtRk4gPSB0bm9ybSh0LCB0b3RhbER1cmF0aW9uKTtcblx0dmFyIHMgPSAwO1xuXHR2YXIgZW5kID0gdCArIHRvdGFsRHVyYXRpb247XG5cdHZhciBkdXJGTlMgPSBkdXJzLm1hcChmdW5jdGlvbihlLGkpe1xuXHRcdHZhciB4ID0gdG5vcm0odCArIHMsIGUpXG5cdFx0cyArPSBlO1xuXHRcdHJldHVybiB4XG5cdH0pXG5cdHZhciBkcCA9IDA7XG5cdHZhciBkdXJwZXJjZW50ID0gZHVycy5tYXAoZnVuY3Rpb24oZSwgaSl7XG5cdFx0dmFyIHggPSAoZSAvIHRvdGFsRHVyYXRpb24pICsgZHA7XG5cdFx0ZHArPSAoZSAvIHRvdGFsRHVyYXRpb24pXG5cdFx0cmV0dXJuIHhcblx0fSlcblx0dmFyIHRuLCBuLCBpLCB2ID0gMCwgZm4gPSAwO1xuXHR2YXIgZW52ZWxvcGUgPSBmdW5jdGlvbih0KXtcblx0XHR0biA9IHRkTm9ybUZOKHQpO1xuXHRcdGlmKDAgPiB0biB8fCB0biA+IDEpIHJldHVybiAwO1xuXHRcdGZuID0gZHVycGVyY2VudC5yZWR1Y2UoZnVuY3Rpb24ocCwgZSwgaSwgZCl7cmV0dXJuICgoZFtpLTFdIHx8IDApIDw9IHRuICYmIHRuIDw9IGUpID8gaSA6IHB9LCAwKVxuXHRcdHYgPSBwdHNbZm5dKGR1ckZOU1tmbl0odCkpXG5cdFx0cmV0dXJuIHZcblx0fVxuXHRyZXR1cm4gZW52ZWxvcGVcblxuXHQvLyBwcm9iYWJseSBkZWxldGFibGVcblx0ZnVuY3Rpb24geGVudmVsb3BlKHQsIHN1c3RhaW4pe1xuXHRcdHRuID0gdGROb3JtRk4odCk7IFxuXHRcdGlmKDAgPj0gdG4gfHwgdG4gID49IDEpIHJldHVybiAwO1xuXHRcdGlmKHRuID4gZHVycGVyY2VudFtmbl0pIGZuID0gKGZuICsgMSA+IHB0cy5sZW5ndGggLSAxID8gMCA6IGZuICsgMSlcblx0XHR2ID0gcHRzW2ZuXShkdXJGTlNbZm5dKHQpKVxuXHRcdHJldHVybiB2XG5cdH1cbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdGFydCwgZHVyLCBtaW4sIG1heCl7XG5cblx0aWYoIW1pbikgbWluID0gMDtcblx0aWYoIW1heCkgbWF4ID0gMTtcblx0dmFyIGVuZCA9IHN0YXJ0ICsgZHVyO1xuXHR2YXIgZCA9IGVuZCAtIHN0YXJ0O1xuXHR2YXIgciA9IG1heCAtIG1pbjtcblxuXHRyZXR1cm4gZnVuY3Rpb24odGltZSl7XG5cblx0XHR4ID0gbWluICsgKHRpbWUgLSBzdGFydCkgKiByIC8gZFxuXHRcdGlmKHggPiAxKXtcbi8vXHRcdFx0Y29uc29sZS5sb2coJ3ByZScsIHRpbWUsIGVuZClcblx0XHRcdGlmKHRpbWUgPCBlbmQpIHggPSBOdW1iZXIoJy4nICsgeC50b1N0cmluZygpLnNwbGl0KCcuJykuam9pbignJykpXG4vL1x0XHRcdGNvbnNvbGUubG9nKCdub3JtJywgeClcblx0XHR9XG5cdFx0cmV0dXJuIHhcblx0fVxuXG59XG4iLCJ2YXIgT1ogPSBtb2R1bGUuZXhwb3J0c1xudmFyIHRhdSA9IE1hdGguUEkgKiAyXG5cbk9aLnNpbmUgPSBzaW5lO1xuT1ouc2F3ID0gc2F3O1xuT1ouc2F3X2kgPSBzYXdfaTtcbk9aLnRyaWFuZ2xlID0gdHJpYW5nbGU7XG5PWi50cmlhbmdsZV9zID0gdHJpYW5nbGVfcztcbk9aLnNxdWFyZSA9IHNxdWFyZTtcblxuZnVuY3Rpb24gc2luZSh0LCBmKXtcblxuICAgIHJldHVybiBNYXRoLnNpbih0ICogdGF1ICogZik7XG4gICAgXG59O1xuXG5mdW5jdGlvbiBzYXcodCwgZil7XG5cbiAgICB2YXIgbiA9ICgodCAlICgxL2YpKSAqIGYpICUgMTsgLy8gbiA9IFswIC0+IDFdXG5cbiAgICByZXR1cm4gLTEgKyAoMiAqIG4pXG5cbn07XG5cbmZ1bmN0aW9uIHNhd19pKHQsIGYpe1xuXG4gICAgdmFyIG4gPSAoKHQgJSAoMS9mKSkgKiBmKSAlIDE7IC8vIG4gPSBbMCAtPiAxXVxuICAgIFxuICAgIHJldHVybiAxIC0gKDIgKiBuKVxuXG59O1xuXG5mdW5jdGlvbiB0cmlhbmdsZSh0LCBmKXtcbiAgICBcbiAgICB2YXIgbiA9ICgodCAlICgxL2YpKSAqIGYpICUgMTsgLy8gbiA9IFswIC0+IDFdXG4gICAgXG4gICAgcmV0dXJuIG4gPCAwLjUgPyAtMSArICgyICogKDIgKiBuKSkgOiAxIC0gKDIgKiAoMiAqIG4pKVxuICAgIFxufTtcblxuZnVuY3Rpb24gdHJpYW5nbGVfcyh0LCBmKXtcbiAgICBcbiAgICB2YXIgbiA9ICgodCAlICgxL2YpKSAqIGYpICUgMTsgLy8gbiA9IFswIC0+IDFdXG4gICAgXG4gICAgdmFyIHMgPSBNYXRoLmFicyhNYXRoLnNpbih0KSk7XG4gICAgXG4gICAgcmV0dXJuIG4gPCBzID8gLTEgKyAoMiAqICgyICogKG4gLyBzKSkpIDogMSAtICgyICogKDIgKiAobiAvIHMpKSlcbiAgICBcbn07XG5cbmZ1bmN0aW9uIHNxdWFyZSh0LCBmKXtcblxuICAgIHJldHVybiAoKHQgJSAoMS9mKSkgKiBmKSAlIDEgPiAwLjUgPyAxIDogLTE7XG5cbn07XG4iXX0=
