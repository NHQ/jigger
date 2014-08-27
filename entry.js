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
