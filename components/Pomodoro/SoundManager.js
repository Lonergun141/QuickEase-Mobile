// SoundManager.js
import { Audio } from 'expo-av';

class SoundManager {
  static instance = null;
  static sound = null;

  static getInstance() {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async loadSound() {
    if (!SoundManager.constructor.sound) {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/Audio/alarm.mp3')
      );
      SoundManager.constructor.sound = sound;
    }
  }

  async playSound() {
    await this.loadSound();
    if (SoundManager.constructor.sound) {
      try {
        await SoundManager.constructor.sound.setPositionAsync(0);
        await SoundManager.constructor.sound.playAsync();
      } catch (error) {
        console.log('Error playing sound:', error);
      }
    }
  }

  async stopSound() {
    if (SoundManager.constructor.sound) {
      try {
        await SoundManager.constructor.sound.stopAsync();
      } catch (error) {
        console.log('Error stopping sound:', error);
      }
    } else {
      console.log('SoundManager.sound is null in stopSound');
    }
  }

  async unloadSound() {
    if (SoundManager.constructor.sound) {
      try {
        await SoundManager.constructor.sound.unloadAsync();
        SoundManager.constructor.sound = null;
      } catch (error) {
        console.log('Error unloading sound:', error);
      }
    }
  }
}

export default SoundManager;
