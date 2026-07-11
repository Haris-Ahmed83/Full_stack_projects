import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import moment from 'moment';

// --- Dummy Data Generation ---
const generateDummyData = (days = 30) => {
  const data = [];
  let currentDate = moment().subtract(days, 'days');

  for (let i = 0; i <= days; i++) {
    const date = currentDate
