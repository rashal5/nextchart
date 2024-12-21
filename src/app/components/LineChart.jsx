'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine, // Import for adding reference line
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-slate-900 flex flex-col gap-4 rounded-md">
        <p className="text-medium text-lg">{label}</p>
        {payload.map((item, index) => (
          <p key={index} className={`text-sm`} style={{ color: item.stroke }}>
            {item.dataKey.charAt(0).toUpperCase() + item.dataKey.slice(1)}:
            <span className="ml-2">${item.value.toFixed(2)}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const FullScreenChart = () => {
  const [btcData, setBtcData] = useState([]);
  const [averagePrice, setAveragePrice] = useState(0); // State to store the average price
  const [activeChart, setActiveChart] = useState('area'); // Toggle between 'area' and 'line'

  useEffect(() => {
    // Fetch BTC data for the past 7 days
    const fetchBtcData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7'
        );
        const data = await response.json();

        // Calculate average price
        const total = data.prices.reduce((sum, item) => sum + item[1], 0);
        const average = total / data.prices.length;
        setAveragePrice(average);

        // Map the data to a format suitable for the charts
        const formattedData = data.prices.map((item) => {
          const date = new Date(item[0]);
          return {
            name: `${date.getMonth() + 1}/${date.getDate()}`,
            price: item[1],
          };
        });

        setBtcData(formattedData);
      } catch (error) {
        console.error('Error fetching BTC data:', error);
      }
    };

    fetchBtcData();
  }, []);

  // Calculate min and max values for dynamic Y-Axis scaling
  const minPrice = Math.min(...btcData.map(item => item.price));
  const maxPrice = Math.max(...btcData.map(item => item.price));
  const adjustedMin = minPrice - (maxPrice - minPrice) * 0.1; // Add some padding
  const adjustedMax = maxPrice + (maxPrice - minPrice) * 0.1; // Add some padding

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Display average value in the background */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md">
        <span className="text-xl">7-Day Average BTC Price: </span>
        <span className="text-2xl font-bold">${averagePrice.toFixed(2)}</span>
      </div>

      {/* Buttons to toggle between charts */}
      <div className="flex justify-center gap-4 py-4 bg-gray-200">
        <button
          className={`px-4 py-2 rounded-md ${
            activeChart === 'area' ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
          onClick={() => setActiveChart('area')}
        >
          Area Chart
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            activeChart === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-300'
          }`}
          onClick={() => setActiveChart('line')}
        >
          Line Chart
        </button>
      </div>

      {/* Full-screen chart */}
      <div className="flex-grow relative">
        {activeChart === 'area' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={btcData}
              margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[adjustedMin, adjustedMax]} /> {/* Dynamic Y-Axis */}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                fill="#3b82f6"
                strokeWidth={3} // Increase stroke width for visibility
              />
              {/* Add a reference line for the average BTC price */}
              <ReferenceLine
                y={averagePrice}
                label={`Avg: $${averagePrice.toFixed(2)}`}
                stroke="red"
                strokeWidth={2}
                labelStyle={{ fill: 'red', fontSize: '14px' }}
                strokeDasharray="5 5" // Make it dashed for better visibility
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={btcData}
              margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[adjustedMin, adjustedMax]} /> {/* Dynamic Y-Axis */}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={3} // Increase stroke width for better visibility
              />
              {/* Add a reference line for the average BTC price */}
              <ReferenceLine
                y={averagePrice}
                label={`Avg: $${averagePrice.toFixed(2)}`}
                stroke="red"
                strokeWidth={2}
                labelStyle={{ fill: 'red', fontSize: '14px' }}
                strokeDasharray="5 5" // Dashed line for distinction
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default FullScreenChart;
