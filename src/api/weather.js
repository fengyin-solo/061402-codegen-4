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

export const getWeatherConfig = () => {
  return WEATHER_CONFIG;
};

export const getWeatherByType = (type) => {
  return WEATHER_CONFIG[type] || WEATHER_CONFIG.sunny;
};

export const generateWeatherForecast = (days = 5, startDay = 1) => {
  const weatherTypes = ['sunny', 'sunny', 'sunny', 'rain', 'heat', 'wind'];
  const forecast = [];
  
  for (let i = 0; i < days; i++) {
    const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    
    forecast.push({
      day: startDay + i,
      weather: randomWeather,
      date: futureDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    });
  }
  
  return forecast;
};

export const calculateGatherAmount = (baseAmount, resourceType, weatherType) => {
  const weather = WEATHER_CONFIG[weatherType] || WEATHER_CONFIG.sunny;
  let amount = baseAmount * weather.effect.gatherEfficiency;
  
  if (resourceType === 'water' && weatherType === 'rain') {
    amount *= 1.5;
  }
  
  return Math.floor(amount);
};

export const calculateConsumption = (baseAmount, resourceType, weatherType) => {
  const weather = WEATHER_CONFIG[weatherType] || WEATHER_CONFIG.sunny;
  let multiplier = 1.0;
  
  if (resourceType === 'water') {
    multiplier = weather.effect.waterConsumption;
  } else if (resourceType === 'food') {
    multiplier = weather.effect.foodConsumption;
  }
  
  return Math.ceil(baseAmount * multiplier);
};

export default {
  getWeatherConfig,
  getWeatherByType,
  generateWeatherForecast,
  calculateGatherAmount,
  calculateConsumption
};
