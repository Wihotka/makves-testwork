import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

// Исходные данные
const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100
  }
];

// Исходные цвета
const defaultColors = {
  uv: '#82ca9d',
  pv: '#8884d8',
  error: 'red'
}

// Вычисляем z-score
function calcZScore(data, key) {
  const values = data.map((point) => point[key]);
  const mean = values.reduce((a, b) => a + b) / values.length;
  const std = Math.sqrt(values.map((value) => (value - mean) ** 2).reduce((a, b) => a + b) / values.length);
  return data.map((point) => ({ ...point, zScore: { ...point.zScore, [key]: (point[key] - mean) / std }}));
}

// Рассчитываем градиент для конкретного графика при z-score > 1
const calcGradient = (data, key) => {
  const zScoreMax = Math.max(...data.map(i => i.zScore[key]));
  const zScoreMin = Math.min(...data.map(i => i.zScore[key]));

  return (zScoreMax - 1) / (zScoreMax - zScoreMin);
};

// Кастомная метка
const CustomizedDot = (props) => {
  const { cx, cy, r, payload, zScoreKey } = props;

  const color = payload.zScore[zScoreKey] > 1
    ? defaultColors.error
    : zScoreKey === 'pv' ? defaultColors.pv : defaultColors.uv;

  return (
     <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={1} fill='white' />
  );
};

// Кастомная активная метка
const CustomizeActivedDot = (props) => {
  const { cx, cy, payload, zScoreKey } = props;

  const color = payload.zScore[zScoreKey] > 1
    ? defaultColors.error
    : zScoreKey === 'pv' ? defaultColors.pv : defaultColors.uv;

  return (
     <circle cx={cx} cy={cy} r={8} stroke='false' fill={color} />
  );
};

function App() {
  // Добавляем z-score в data
  const dataWithZScore = calcZScore(calcZScore(data, 'pv'), 'uv');

  // Объявляем градиенты
  const pvGradient = calcGradient(dataWithZScore, 'pv'),
    uvGradient = calcGradient(dataWithZScore, 'uv');

  return (
    <LineChart
      width={1000}
      height={600}
      data={dataWithZScore}
      margin={{
        top: 50,
        right: 50,
        left: 50,
        bottom: 50
      }}
    >
      <defs>
        <linearGradient id='pvColor' x1='0' y1='0' x2='0' y2='1'>
          <stop offset={pvGradient} stopColor={defaultColors.error} />
          <stop offset={pvGradient} stopColor={defaultColors.pv} />
        </linearGradient>
        <linearGradient id='uvColor' x1='0' y1='0' x2='0' y2='1'>
          <stop offset={uvGradient} stopColor={defaultColors.error} />
          <stop offset={uvGradient} stopColor={defaultColors.uv} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey='name' />
      <YAxis />
      <Tooltip />
      <Line
        type='monotone'
        dataKey='pv'
        stroke='url(#pvColor)'
        dot={<CustomizedDot zScoreKey='pv' />}
        activeDot={<CustomizeActivedDot zScoreKey='pv' />}
      />
      <Line
        type='monotone'
        dataKey='uv'
        stroke='url(#uvColor)'
        dot={<CustomizedDot zScoreKey='uv' />}
        activeDot={<CustomizeActivedDot zScoreKey='uv' />}
      />
    </LineChart>
  );
}

export default App;
