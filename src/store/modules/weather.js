import { defineStore } from 'pinia';

const WEATHER_CONFIG = {
  sunny: {
    type: 'sunny',
    name: '晴天',
    icon: '☀️',
    description: '阳光明媚，适合外出采集',
    effect: {
      gatherEfficiency: 1.0,
      mapEventRate: 1.0,
      shelterDamage: 0,
      waterConsumption: 1.0,
      foodConsumption: 1.0
    }
  },
  rain: {
    type: 'rain',
    name: '暴雨',
    icon: '🌧️',
    description: '暴雨倾盆，采集效率下降，但水资源丰富',
    effect: {
      gatherEfficiency: 0.6,
      mapEventRate: 1.3,
      shelterDamage: 5,
      waterConsumption: 0.5,
      foodConsumption: 1.2
    }
  },
  heat: {
    type: 'heat',
    name: '酷热',
    icon: '🔥',
    description: '烈日炎炎，水分消耗加快，需要注意防暑',
    effect: {
      gatherEfficiency: 0.7,
      mapEventRate: 0.8,
      shelterDamage: 2,
      waterConsumption: 2.0,
      foodConsumption: 0.8
    }
  },
  wind: {
    type: 'wind',
    name: '大风',
    icon: '💨',
    description: '狂风大作，庇护所受损严重，外出危险',
    effect: {
      gatherEfficiency: 0.5,
      mapEventRate: 1.5,
      shelterDamage: 10,
      waterConsumption: 1.3,
      foodConsumption: 1.3
    }
  }
};

export default defineStore('weather', {
  state: () => ({
    currentWeather: 'sunny',
    forecast: [],
    shelter: {
      level: 1,
      durability: 100,
      maxDurability: 100,
      built: false
    },
    day: 1,
    weatherHistory: []
  }),

  getters: {
    getCurrentWeather: (state) => {
      return WEATHER_CONFIG[state.currentWeather];
    },
    getWeatherEffect: (state) => {
      return WEATHER_CONFIG[state.currentWeather].effect;
    },
    getWeatherByType: () => (type) => {
      return WEATHER_CONFIG[type] || WEATHER_CONFIG.sunny;
    },
    getShelterStatus: (state) => {
      return state.shelter;
    },
    getForecastWithDetails: (state) => {
      return state.forecast.map(item => ({
        ...item,
        ...WEATHER_CONFIG[item.weather]
      }));
    },
    isBadWeather: (state) => {
      return state.currentWeather !== 'sunny';
    }
  },

  actions: {
    initWeather() {
      this.currentWeather = 'sunny';
      this.day = 1;
      this.shelter = {
        level: 1,
        durability: 100,
        maxDurability: 100,
        built: false
      };
      this.generateForecast();
    },

    generateForecast(days = 5) {
      const weatherTypes = ['sunny', 'sunny', 'sunny', 'rain', 'heat', 'wind'];
      const forecast = [];
      
      for (let i = 0; i < days; i++) {
        const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + i);
        
        forecast.push({
          day: this.day + i,
          weather: randomWeather,
          date: futureDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
        });
      }
      
      this.forecast = forecast;
    },

    advanceDay() {
      this.weatherHistory.push({
        day: this.day,
        weather: this.currentWeather
      });
      
      if (this.weatherHistory.length > 10) {
        this.weatherHistory.shift();
      }
      
      this.day += 1;
      
      if (this.forecast.length > 0) {
        this.currentWeather = this.forecast[0].weather;
        this.forecast.shift();
      } else {
        this.currentWeather = this.getRandomWeather();
      }
      
      this.generateForecast(5);
      this.applyWeatherDamage();
    },

    getRandomWeather() {
      const weatherTypes = ['sunny', 'sunny', 'sunny', 'rain', 'heat', 'wind'];
      return weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    },

    applyWeatherDamage() {
      if (!this.shelter.built) return;
      
      const weather = WEATHER_CONFIG[this.currentWeather];
      const damage = weather.effect.shelterDamage;
      
      if (damage > 0) {
        this.shelter.durability = Math.max(0, this.shelter.durability - damage);
      }
    },

    buildShelter() {
      this.shelter.built = true;
      this.shelter.durability = this.shelter.maxDurability;
    },

    repairShelter(amount = 20) {
      if (!this.shelter.built) return false;
      
      this.shelter.durability = Math.min(
        this.shelter.maxDurability,
        this.shelter.durability + amount
      );
      return true;
    },

    upgradeShelter() {
      this.shelter.level += 1;
      this.shelter.maxDurability += 50;
      this.shelter.durability = this.shelter.maxDurability;
    },

    calculateGatherAmount(baseAmount, resourceType) {
      const effect = WEATHER_CONFIG[this.currentWeather].effect;
      let amount = baseAmount * effect.gatherEfficiency;
      
      if (resourceType === 'water' && this.currentWeather === 'rain') {
        amount *= 1.5;
      }
      
      return Math.floor(amount);
    },

    calculateConsumption(baseAmount, resourceType) {
      const effect = WEATHER_CONFIG[this.currentWeather].effect;
      let multiplier = 1.0;
      
      if (resourceType === 'water') {
        multiplier = effect.waterConsumption;
      } else if (resourceType === 'food') {
        multiplier = effect.foodConsumption;
      }
      
      return Math.ceil(baseAmount * multiplier);
    },

    getMapEventModifier() {
      return WEATHER_CONFIG[this.currentWeather].effect.mapEventRate;
    },

    setWeather(type) {
      if (WEATHER_CONFIG[type]) {
        this.currentWeather = type;
      }
    }
  }
});
