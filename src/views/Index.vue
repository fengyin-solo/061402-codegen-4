<template>
  <div class="island-container">
    <div class="island-header">
      <h1>🏝️ 海岛生存</h1>
      <p>在荒岛上建立你的生存基地</p>
      <div class="day-info">第 {{ weatherStore.day }} 天</div>
    </div>
    
    <div class="island-main">
      <div class="weather-panel">
        <div class="current-weather">
          <div class="weather-icon-large">{{ currentWeather.icon }}</div>
          <div class="weather-info">
            <h3>{{ currentWeather.name }}</h3>
            <p class="weather-desc">{{ currentWeather.description }}</p>
          </div>
        </div>
        
        <div class="weather-effects">
          <div class="effect-item">
            <span class="effect-label">采集效率</span>
            <span :class="'effect-value ' + (weatherEffect.gatherEfficiency >= 1 ? 'positive' : 'negative')">
              {{ (weatherEffect.gatherEfficiency * 100).toFixed(0) }}%
            </span>
          </div>
          <div class="effect-item">
            <span class="effect-label">事件概率</span>
            <span :class="'effect-value ' + (weatherEffect.mapEventRate <= 1 ? 'positive' : 'negative')">
              {{ (weatherEffect.mapEventRate * 100).toFixed(0) }}%
            </span>
          </div>
          <div class="effect-item">
            <span class="effect-label">水分消耗</span>
            <span :class="'effect-value ' + (weatherEffect.waterConsumption <= 1 ? 'positive' : 'negative')">
              {{ (weatherEffect.waterConsumption * 100).toFixed(0) }}%
            </span>
          </div>
        </div>
        
        <div class="forecast-section">
          <h4>📅 未来天气</h4>
          <div class="forecast-list">
            <div v-for="(day, index) in forecastList" :key="index" class="forecast-item">
              <div class="forecast-day">{{ day.date }}</div>
              <div class="forecast-icon">{{ day.icon }}</div>
              <div class="forecast-name">{{ day.name }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="shelter.built" class="shelter-status">
          <h4>🏠 庇护所状态</h4>
          <div class="durability-bar">
            <div 
              class="durability-fill" 
              :style="{ width: shelterDurabilityPercent + '%' }"
              :class="{ 'low': shelterDurabilityPercent < 30, 'medium': shelterDurabilityPercent >= 30 && shelterDurabilityPercent < 70 }"
            ></div>
          </div>
          <div class="durability-text">
            耐久度: {{ shelter.durability }} / {{ shelter.maxDurability }}
            <span v-if="weatherEffect.shelterDamage > 0" class="damage-warning">
              (今日 -{{ weatherEffect.shelterDamage }})
            </span>
          </div>
          <button class="repair-btn" @click="repairShelter" :disabled="!canRepair">
            🔧 修复庇护所 (10木材, 5石头)
          </button>
        </div>
      </div>
      
      <div class="stats-panel">
        <div class="stat-card">
          <div class="stat-icon">🍖</div>
          <div class="stat-content">
            <div class="stat-number">{{ resources.food }}</div>
            <div class="stat-label">食物</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💧</div>
          <div class="stat-content">
            <div class="stat-number">{{ resources.water }}</div>
            <div class="stat-label">淡水</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">🪵</div>
          <div class="stat-content">
            <div class="stat-number">{{ resources.wood }}</div>
            <div class="stat-label">木材</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⛏️</div>
          <div class="stat-content">
            <div class="stat-number">{{ resources.stone }}</div>
            <div class="stat-label">石头</div>
          </div>
        </div>
      </div>
      
      <div class="actions-panel">
        <h3>📋 可执行操作</h3>
        
        <div class="action-grid">
          <div class="action-card" @click="gatherFood">
            <div class="action-icon">🍓</div>
            <div class="action-title">采集食物</div>
            <div class="action-desc">在岛上寻找可食用的果实和动物</div>
            <div class="action-time">耗时: 30秒</div>
          </div>
          
          <div class="action-card" @click="collectWater">
            <div class="action-icon">💧</div>
            <div class="action-title">收集淡水</div>
            <div class="action-desc">收集雨水或净化海水</div>
            <div class="action-time">耗时: 1分钟</div>
          </div>
          
          <div class="action-card" @click="chopWood">
            <div class="action-icon">🪓</div>
            <div class="action-title">砍伐木材</div>
            <div class="action-desc">砍伐树木获取木材资源</div>
            <div class="action-time">耗时: 2分钟</div>
          </div>
          
          <div class="action-card" @click="mineStone">
            <div class="action-icon">⛏️</div>
            <div class="action-title">挖掘石头</div>
            <div class="action-desc">在岛上挖掘石头资源</div>
            <div class="action-time">耗时: 3分钟</div>
          </div>
          
          <div class="action-card" @click="buildShelter">
            <div class="action-icon">🏠</div>
            <div class="action-title">建造庇护所</div>
            <div class="action-desc">建造一个安全的住所</div>
            <div class="action-cost">需要: 50木材, 30石头</div>
          </div>
          
          <div class="action-card" @click="craftTools">
            <div class="action-icon">🔨</div>
            <div class="action-title">制作工具</div>
            <div class="action-desc">制作更高效的生存工具</div>
            <div class="action-cost">需要: 20木材, 10石头</div>
          </div>
        </div>
      </div>
      
      <div class="map-panel">
        <h3>🗺️ 海岛地图</h3>
        <div class="map-container">
          <div class="map-grid">
            <div v-for="(cell, index) in mapGrid" :key="index" 
                 :class="'map-cell ' + cell.type"
                 @click="exploreCell(index)">
              {{ cell.icon }}
            </div>
          </div>
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-icon">🌳</span>
              <span>森林</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🏔️</span>
              <span>山地</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🌊</span>
              <span>海洋</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon">🏠</span>
              <span>营地</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="message-log">
      <h3>📜 生存日志</h3>
      <div class="log-list">
        <div v-for="(msg, index) in messageLog" :key="index" class="log-item">
          <span class="log-time">{{ msg.time }}</span>
          <span class="log-content">{{ msg.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useWeatherStore } from '../store';

const weatherStore = useWeatherStore();

const resources = ref({
  food: 100,
  water: 100,
  wood: 100,
  stone: 100
});

const messageLog = ref([
  { time: '00:00', content: '你来到了一个荒岛，开始你的生存之旅吧！' }
]);

const mapGrid = ref([
  { type: 'forest', icon: '🌳', explored: true },
  { type: 'forest', icon: '🌳', explored: true },
  { type: 'mountain', icon: '🏔️', explored: false },
  { type: 'ocean', icon: '🌊', explored: false },
  { type: 'camp', icon: '🏠', explored: true },
  { type: 'forest', icon: '🌳', explored: false },
  { type: 'ocean', icon: '🌊', explored: false },
  { type: 'mountain', icon: '🏔️', explored: false },
  { type: 'forest', icon: '🌳', explored: false }
]);

const currentWeather = computed(() => weatherStore.getCurrentWeather);
const weatherEffect = computed(() => weatherStore.getWeatherEffect);
const forecastList = computed(() => weatherStore.getForecastWithDetails);
const shelter = computed(() => weatherStore.shelter);

const shelterDurabilityPercent = computed(() => {
  if (!weatherStore.shelter.built) return 0;
  return (weatherStore.shelter.durability / weatherStore.shelter.maxDurability) * 100;
});

const canRepair = computed(() => {
  return weatherStore.shelter.built && 
         weatherStore.shelter.durability < weatherStore.shelter.maxDurability &&
         resources.value.wood >= 10 &&
         resources.value.stone >= 5;
});

const addMessage = (content) => {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  messageLog.value.push({ time, content });
  if (messageLog.value.length > 20) {
    messageLog.value.shift();
  }
};

const performAction = (name, cost, gain, time, resourceType = null) => {
  for (const [resource, amount] of Object.entries(cost)) {
    if (resources.value[resource] < amount) {
      ElMessage.error(`资源不足，无法${name}`);
      return false;
    }
  }
  
  for (const [resource, amount] of Object.entries(cost)) {
    resources.value[resource] -= amount;
  }
  
  addMessage(`开始${name}...`);
  
  setTimeout(() => {
    const actualGain = {};
    for (const [resource, amount] of Object.entries(gain)) {
      const actualAmount = weatherStore.calculateGatherAmount(amount, resource);
      actualGain[resource] = actualAmount;
      resources.value[resource] += actualAmount;
    }
    addMessage(`${name}完成！获得了${Object.entries(actualGain).map(([k, v]) => `${v}${getResourceName(k)}`).join('、')}`);
    ElMessage.success(`${name}完成！`);
  }, time);
  
  return true;
};

const getResourceName = (type) => {
  const names = {
    food: '食物',
    water: '淡水',
    wood: '木材',
    stone: '石头'
  };
  return names[type] || type;
};

const gatherFood = () => {
  performAction('采集食物', {}, { food: 20 }, 30000, 'food');
};

const collectWater = () => {
  performAction('收集淡水', {}, { water: 30 }, 60000, 'water');
};

const chopWood = () => {
  performAction('砍伐木材', {}, { wood: 15 }, 120000, 'wood');
};

const mineStone = () => {
  performAction('挖掘石头', {}, { stone: 10 }, 180000, 'stone');
};

const buildShelter = () => {
  if (weatherStore.shelter.built) {
    ElMessage.info('你已经建造了庇护所');
    return;
  }
  if (performAction('建造庇护所', { wood: 50, stone: 30 }, {}, 300000)) {
    setTimeout(() => {
      weatherStore.buildShelter();
      addMessage('庇护所建造完成！你现在有了一个安全的住所。');
    }, 300000);
  }
};

const repairShelter = () => {
  if (!canRepair.value) return;
  
  resources.value.wood -= 10;
  resources.value.stone -= 5;
  weatherStore.repairShelter(20);
  addMessage('修复庇护所！耐久度恢复了20点。');
  ElMessage.success('庇护所修复完成！');
};

const craftTools = () => {
  if (performAction('制作工具', { wood: 20, stone: 10 }, {}, 120000)) {
    addMessage('工具制作完成！你的工作效率提高了。');
  }
};

const exploreCell = (index) => {
  const cell = mapGrid.value[index];
  if (cell.explored) {
    ElMessage.info('这个区域已经探索过了');
    return;
  }
  
  const eventModifier = weatherStore.getMapEventModifier();
  
  ElMessageBox.confirm(
    `确定要探索这个区域吗？当前天气下${eventModifier > 1 ? '危险事件概率增加' : '相对安全'}。`,
    '探索未知区域',
    {
      confirmButtonText: '开始探索',
      cancelButtonText: '取消',
      type: eventModifier > 1 ? 'warning' : 'info'
    }
  ).then(() => {
    addMessage(`开始探索${cell.icon}区域...`);
    
    setTimeout(() => {
      cell.explored = true;
      
      const random = Math.random();
      const dangerThreshold = 0.8 / eventModifier;
      
      if (random < 0.3 / eventModifier) {
        const foodGain = Math.floor(Math.random() * 20) + 10;
        resources.value.food += foodGain;
        addMessage(`探索发现了食物！获得${foodGain}食物`);
        ElMessage.success(`探索发现了食物！获得${foodGain}食物`);
      } else if (random < 0.6 / eventModifier) {
        const woodGain = Math.floor(Math.random() * 15) + 5;
        resources.value.wood += woodGain;
        addMessage(`探索发现了木材！获得${woodGain}木材`);
        ElMessage.success(`探索发现了木材！获得${woodGain}木材`);
      } else if (random < dangerThreshold) {
        const stoneGain = Math.floor(Math.random() * 10) + 5;
        resources.value.stone += stoneGain;
        addMessage(`探索发现了石头！获得${stoneGain}石头`);
        ElMessage.success(`探索发现了石头！获得${stoneGain}石头`);
      } else {
        const foodLoss = Math.floor(10 * eventModifier);
        const waterLoss = Math.floor(10 * eventModifier);
        resources.value.food -= foodLoss;
        resources.value.water -= waterLoss;
        addMessage(`探索遇到了危险！损失了${foodLoss}食物和${waterLoss}水`);
        ElMessage.warning(`探索遇到了危险！损失了${foodLoss}食物和${waterLoss}水`);
      }
    }, 5000);
  }).catch(() => {
    addMessage('取消了探索');
  });
};

const advanceDay = () => {
  weatherStore.advanceDay();
  addMessage(`新的一天开始了！今天天气：${currentWeather.value.name}`);
  
  if (weatherEffect.value.shelterDamage > 0 && weatherStore.shelter.built) {
    addMessage(`天气恶劣，庇护所受损 ${weatherEffect.value.shelterDamage} 点耐久度`);
  }
};

const resetGame = () => {
  resources.value = {
    food: 100,
    water: 100,
    wood: 100,
    stone: 100
  };
  weatherStore.initWeather();
  messageLog.value = [
    { time: '00:00', content: '你来到了一个荒岛，开始你的生存之旅吧！' }
  ];
  mapGrid.value.forEach((cell, index) => {
    if (index !== 0 && index !== 1 && index !== 4) {
      cell.explored = false;
    }
  });
  addMessage('重新开始游戏！');
};

onMounted(() => {
  weatherStore.initWeather();
  addMessage('欢迎来到海岛生存游戏！');
  addMessage(`今日天气：${currentWeather.value.name} - ${currentWeather.value.description}`);
  
  setInterval(() => {
    const foodConsumption = weatherStore.calculateConsumption(5, 'food');
    const waterConsumption = weatherStore.calculateConsumption(5, 'water');
    
    resources.value.food -= foodConsumption;
    resources.value.water -= waterConsumption;
    
    if (resources.value.food <= 0 || resources.value.water <= 0) {
      ElMessageBox.alert(
        '你的食物或水耗尽了，游戏结束！',
        '游戏结束',
        {
          confirmButtonText: '重新开始',
          type: 'error'
        }
      ).then(() => {
        resetGame();
      });
    }
  }, 60000);
});
</script>

<style scoped>
.island-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.island-header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.island-header h1 {
  font-size: 48px;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.island-header p {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
}

.island-main {
  max-width: 1200px;
  margin: 0 auto;
}

.day-info {
  font-size: 20px;
  margin-top: 10px;
  font-weight: bold;
}

.weather-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.current-weather {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.weather-icon-large {
  font-size: 80px;
  margin-right: 30px;
}

.weather-info h3 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #333;
}

.weather-desc {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.weather-effects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.effect-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.effect-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.effect-value {
  font-size: 24px;
  font-weight: bold;
}

.effect-value.positive {
  color: #67c23a;
}

.effect-value.negative {
  color: #f56c6c;
}

.forecast-section {
  margin-bottom: 25px;
}

.forecast-section h4 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.forecast-list {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.forecast-item {
  flex: 0 0 100px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px 10px;
  text-align: center;
  transition: all 0.3s ease;
}

.forecast-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.forecast-day {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.forecast-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.forecast-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.shelter-status {
  background: #f0f7ff;
  border-radius: 8px;
  padding: 20px;
}

.shelter-status h4 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.durability-bar {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.durability-fill {
  height: 100%;
  background: linear-gradient(90deg, #67c23a, #95d475);
  transition: width 0.3s ease;
}

.durability-fill.medium {
  background: linear-gradient(90deg, #e6a23c, #f0c78a);
}

.durability-fill.low {
  background: linear-gradient(90deg, #f56c6c, #f89898);
}

.durability-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.damage-warning {
  color: #f56c6c;
  font-weight: bold;
}

.repair-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.repair-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.repair-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.actions-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.actions-panel h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.action-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.action-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.action-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.action-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.action-time,
.action-cost {
  font-size: 12px;
  color: #999;
}

.map-panel {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-panel h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.map-container {
  text-align: center;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
}

.map-cell {
  width: 100px;
  height: 100px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #ddd;
}

.map-cell:hover {
  transform: scale(1.05);
  border-color: #667eea;
}

.map-cell.explored {
  background: #e8f4fa;
  border-color: #409eff;
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.legend-icon {
  font-size: 24px;
}

.message-log {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.message-log h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #333;
}

.log-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
}

.log-item {
  display: flex;
  margin-bottom: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.log-time {
  font-weight: bold;
  color: #409eff;
  margin-right: 12px;
  min-width: 60px;
}

.log-content {
  flex: 1;
  color: #666;
}

@media (max-width: 768px) {
  .island-header h1 {
    font-size: 32px;
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>