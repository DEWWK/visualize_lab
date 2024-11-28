const https = require('https');
const fs = require('fs');
const { stringify } = require('csv-stringify');

// 替换为你的高德API key
const API_KEY = "f391f910c443275f8b420c9669fd274b";

// 请求参数
const url = `curl "https://api.caiyunapp.com/v2.6/Y2FpeXVuX25vdGlmeQ==/101.6656,39.2072/hourly?hourlysteps=1"`;

https.get(url, (res) => {
    let data = '';

    // 收集数据块
    res.on('data', (chunk) => {
        data += chunk;
    });

    // 数据接收完成
    res.on('end', () => {
        try {
            const weatherData = JSON.parse(data);

            if (weatherData.status === '1') {
                const lives = weatherData.lives || [];

                if (lives.length > 0) {
                    const liveWeather = lives[0]; // 获取第一个结果

                    // 准备CSV数据
                    const csvData = [
                        ["province", "city", "code", "weather", "temperature(°C)", "winddirection", "windpower", "humidity(%)", "updatetime"],
                        [
                            liveWeather.province,
                            liveWeather.city,
                            liveWeather.adcode,
                            liveWeather.weather,
                            liveWeather.temperature,
                            liveWeather.winddirection,
                            liveWeather.windpower,
                            liveWeather.humidity,
                            liveWeather.reporttime
                        ]
                    ];

                    // 写入CSV文件
                    const output = fs.createWriteStream('../data/tem.csv');
                    const stringifier = stringify();

                    csvData.forEach(row => stringifier.write(row));
                    stringifier.pipe(output);

                    stringifier.on('finish', () => {
                        console.log("天气数据已成功保存到 result.csv 文件中");
                    });
                } else {
                    console.log("未找到天气数据");
                }
            } else {
                console.log("请求失败，错误信息：", weatherData.info);
            }
        } catch (error) {
            console.error("解析数据时出错：", error.message);
        }
    });

}).on('error', (error) => {
    console.error(`HTTP请求失败：${error.message}`);
});
