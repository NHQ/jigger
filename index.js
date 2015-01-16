var nvelope = require('nvelope')


module.exports = chrono

function chrono(_time){
  if(!(this instanceof chrono)) return new chrono(_time)
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
