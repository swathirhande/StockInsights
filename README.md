# **Stock Insights: Angular-Powered Market Analysis**  

## 🚀 **Overview**  
Stock Insights is an **advanced stock market analysis platform** built using **Angular and Node.js**, providing **real-time stock data, insights, news, and AI-powered recommendations**. The platform enables users to **search for stock tickers, view detailed summaries, track stocks in a watchlist, and manage their portfolio**. It seamlessly integrates **Finnhub API, Polygon.io, and Gemini AI** to deliver up-to-date market information and intelligent predictions.

🔗 **Live Website:** [Stock Insights](https://angular-stock-frontend.onrender.com/search/home)  
📂 **GitHub Repository:** [`StockInsights`](git@github.com:swathirhande/StockInsights.git)

---

## 🏗 **Tech Stack**  

### **Frontend Technologies:**  
✅ **HTML** (Semantic structure)  
✅ **CSS** (Styling)  
✅ **Bootstrap** (Responsive design)  
✅ **Angular (TypeScript)** (Component-based UI)

### **Backend Technologies:**  
✅ **Node.js** (Server-side logic)  
✅ **Express.js** (Routing & API handling)  
✅ **MongoDB** (Database for watchlist & portfolio storage)  
✅ **RESTful APIs** (Efficient backend communication)

### **APIs & Tools:**  
✅ **Finnhub API** (Real-time stock market data)  
✅ **Gemini AI** (AI-powered stock insights)  
✅ **Highcharts** (Interactive stock charts)  
✅ **Polygon.io** (Market & financial data)  
✅ **Axios** (Efficient data fetching)

---

## 🌟 **Key Features**  

### 🔍 **1. Stock Search & Autocomplete**  
- Users can **type a stock ticker** and receive **autocomplete suggestions**.  
- On pressing **Enter** or clicking the **Search icon**, the backend validates the ticker.  
- If **invalid**, an error message is displayed. If **valid**, users see:  
  ✅ **Stock summary**  
  ✅ **Top news articles** (with links)  
  ✅ **Interactive stock charts**  
  ✅ **Insights on Insider Sentiments, Recommendation Trends, and AI-Powered Insights powered by Gemini AI** 

### ⭐ **2. Watchlist (Favorites)**  
- Users can **add stocks to their favorites**, stored in **MongoDB**.  
- Displays:  
  ✅ **Ticker Symbol**  
  ✅ **Company Name**  
  ✅ **Current Stock Value**  
  ✅ **Change in Value**  

### 📈 **3. Portfolio Management**  
- Users can **buy stocks** and manage investments.  
- Displays for each stock:  
  ✅ **Stock Name**  
  ✅ **Quantity**  
  ✅ **Average Cost per Share**  
  ✅ **Total Cost**  
  ✅ **Change in Value**  
  ✅ **Current Price**  
  ✅ **Market Value**  
- **Wallet balance is visible** to track available funds.

### 📊 **4. Real-Time Stock Data & AI Insights**  
- **Stock values update dynamically** using **Finnhub & Polygon.io** APIs.  
- **Gemini AI** analyzes trends and suggests **AI-driven insights**.  

### 📰 **5. Latest Market News**  
- Fetches **top financial news** related to searched stocks.  
- Clickable links for **detailed articles**.

---

## 🛠 **Installation & Setup**  

### **1️⃣ Clone the Repository**  
```sh
git clone git@github.com:swathirhande/StockInsights.git
cd StockInsights
```

### **2️⃣ Backend Setup**  
```sh
cd backend
npm install  # Install dependencies
```
- Create a **.env** file and set environment variables:  
  ```sh
  FINHUB_API_KEY=your_finnhub_api_key
  API_KEY=your_polygon_api_key
  MONGODB_URI1=your_mongodb_uri
  GOOGLE_API_KEY=your_google_api_key
  DBNAME1=your_db_name
  COLLECTION_NAME1=your_collection_name
  DBNAME2=your_second_db_name
  ```
- Start the backend:  
  ```sh
  node server.js
  ```

### **3️⃣ Frontend Setup**  
```sh
cd frontend
npm install  # Install dependencies
```
- Create a **.env** file and set frontend environment variables:  
  ```sh
  BACKEND_URL=http://localhost:5000
  ```
- Start the Angular frontend:  
  ```sh
  npm serve
  ```
- Open **http://localhost:4200/** in your browser.


## 🤝 **Contributing**  
Contributions are welcome! If you’d like to **enhance the project**, feel free to:  
1. **Fork** the repo  
2. **Create a feature branch** (`git checkout -b feature-name`)  
3. **Commit changes** (`git commit -m "Added feature X"`)  
4. **Push to branch** (`git push origin feature-name`)  
5. **Submit a Pull Request** 🎉  

---

## 📩 **Contact & Connect**  
📌 **Portfolio:** [https://swathirhande.github.io/Portfolio/]  
📌 **LinkedIn:** [https://www.linkedin.com/in/swathiRajendraPrasad]  
📌 **Email:** [swathi@usc.edu]  

🔗 **Live Website:** [Stock Insights](https://angular-stock-frontend.onrender.com/search/home)  
