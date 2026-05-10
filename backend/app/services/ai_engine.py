"""
AI分析引擎
- 活动模式识别
- 异常检测
- 用户画像构建
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
import numpy as np
from collections import defaultdict


class ActivityPatternAnalyzer:
    """活动模式分析器"""
    
    def __init__(self):
        # 正常活动阈值
        self.NORMAL_ACTIVITY_THRESHOLD = 0.1
        self.ABNORMAL_SCORE_THRESHOLD = 0.7
    
    def detect_anomaly(self, activities: List[Dict]) -> Dict:
        """
        检测异常活动模式
        返回: {
            "is_anomaly": bool,
            "anomaly_type": str,
            "severity": float,
            "details": str
        }
        """
        if not activities:
            return {
                "is_anomaly": True,
                "anomaly_type": "no_data",
                "severity": 0.9,
                "details": "无活动数据，可能设备离线或老人长时间未活动"
            }
        
        # 分析过去24小时活动
        now = datetime.utcnow()
        last_24h = [a for a in activities if a["timestamp"] >= now - timedelta(hours=24)]
        
        if not last_24h:
            return {
                "is_anomaly": True,
                "anomaly_type": "no_activity_24h",
                "severity": 0.95,
                "details": "过去24小时无活动记录"
            }
        
        # 检测长时间无活动
        max_inactive = self._max_inactive_period(last_24h)
        if max_inactive > 12:  # 超过12小时无活动
            return {
                "is_anomaly": True,
                "anomaly_type": "long_inactive",
                "severity": min(max_inactive / 24, 1.0),
                "details": f"检测到{max_inactive:.1f}小时无活动"
            }
        
        # 检测活动模式异常（与历史对比）
        # 这里简化处理，实际应使用用户历史数据对比
        avg_activity = sum(a["activity_score"] for a in last_24h) / len(last_24h)
        if avg_activity < 0.05:
            return {
                "is_anomaly": True,
                "anomaly_type": "low_activity",
                "severity": 0.6,
                "details": "活动量显著低于正常水平"
            }
        
        return {
            "is_anomaly": False,
            "anomaly_type": "normal",
            "severity": 0.0,
            "details": "活动模式正常"
        }
    
    def _max_inactive_period(self, activities: List[Dict]) -> float:
        """计算最长无活动时间（小时）"""
        sorted_activities = sorted(activities, key=lambda x: x["timestamp"])
        
        max_gap = 0
        for i in range(1, len(sorted_activities)):
            gap = (sorted_activities[i]["timestamp"] - sorted_activities[i-1]["timestamp"]).total_seconds() / 3600
            if gap > max_gap:
                max_gap = gap
        
        return max_gap
    
    def generate_daily_summary(self, activities: List[Dict]) -> Dict:
        """生成每日活动摘要"""
        if not activities:
            return {
                "wake_time": None,
                "sleep_time": None,
                "activity_score": 0,
                "total_active_minutes": 0
            }
        
        # 按小时聚合
        hourly = defaultdict(list)
        for a in activities:
            hour = a["timestamp"].hour
            hourly[hour].append(a["activity_score"])
        
        # 计算平均活动分数
        all_scores = [a["activity_score"] for a in activities]
        avg_score = sum(all_scores) / len(all_scores) * 100
        
        # 估算起床时间（第一个活动高峰）
        wake_time = None
        for hour in range(5, 12):
            if hour in hourly and sum(hourly[hour]) / len(hourly[hour]) > 0.2:
                wake_time = f"{hour:02d}:00"
                break
        
        # 估算入睡时间（最后一个活动）
        sleep_time = None
        for hour in range(23, 17, -1):
            if hour in hourly and sum(hourly[hour]) / len(hourly[hour]) > 0.1:
                sleep_time = f"{hour:02d}:00"
                break
        
        # 计算活跃分钟数（活动分数>0.1的小时数*60）
        active_hours = sum(1 for h, scores in hourly.items() if sum(scores)/len(scores) > 0.1)
        
        return {
            "wake_time": wake_time,
            "sleep_time": sleep_time,
            "activity_score": round(avg_score),
            "total_active_minutes": active_hours * 60,
            "hourly_distribution": {
                str(h): round(sum(scores)/len(scores), 2) 
                for h, scores in hourly.items()
            }
        }


class UserProfileBuilder:
    """用户画像构建器"""
    
    def build_profile(self, historical_data: List[Dict]) -> Dict:
        """
        基于历史数据构建用户画像
        historical_data: 过去30天的活动数据
        """
        if not historical_data:
            return self._default_profile()
        
        # 分析作息规律
        wake_times = []
        sleep_times = []
        
        for day_data in historical_data:
            summary = ActivityPatternAnalyzer().generate_daily_summary(day_data)
            if summary["wake_time"]:
                wake_times.append(summary["wake_time"])
            if summary["sleep_time"]:
                sleep_times.append(summary["sleep_time"])
        
        # 计算平均作息
        avg_wake = self._average_time(wake_times) if wake_times else "07:00"
        avg_sleep = self._average_time(sleep_times) if sleep_times else "22:00"
        
        # 分析活动模式
        activity_pattern = self._analyze_activity_pattern(historical_data)
        
        return {
            "wake_time_avg": avg_wake,
            "sleep_time_avg": avg_sleep,
            "activity_pattern": activity_pattern,
            "regularity_score": self._calculate_regularity(wake_times, sleep_times),
            "interests": [],  # 需要从聊天数据中提取
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def _default_profile(self) -> Dict:
        """默认画像"""
        return {
            "wake_time_avg": "07:00",
            "sleep_time_avg": "22:00",
            "activity_pattern": "unknown",
            "regularity_score": 0.5,
            "interests": [],
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def _average_time(self, times: List[str]) -> str:
        """计算平均时间"""
        if not times:
            return "07:00"
        
        # 简化处理：取最常见的时段
        from collections import Counter
        hour_counts = Counter(t.split(":")[0] for t in times)
        most_common_hour = hour_counts.most_common(1)[0][0]
        return f"{most_common_hour}:00"
    
    def _analyze_activity_pattern(self, historical_data: List[Dict]) -> str:
        """分析活动模式类型"""
        # 简化版：根据活动量分布判断
        morning_active = 0
        afternoon_active = 0
        evening_active = 0
        
        for day_data in historical_data:
            for activity in day_data:
                hour = activity["timestamp"].hour
                if 6 <= hour < 12:
                    morning_active += activity["activity_score"]
                elif 12 <= hour < 18:
                    afternoon_active += activity["activity_score"]
                else:
                    evening_active += activity["activity_score"]
        
        total = morning_active + afternoon_active + evening_active
        if total == 0:
            return "unknown"
        
        # 判断主要活动时段
        morning_ratio = morning_active / total
        afternoon_ratio = afternoon_active / total
        
        if morning_ratio > 0.5:
            return "morning_person"
        elif afternoon_ratio > 0.4:
            return "afternoon_person"
        else:
            return "balanced"
    
    def _calculate_regularity(self, wake_times: List[str], sleep_times: List[str]) -> float:
        """计算作息规律度 (0-1)"""
        if len(wake_times) < 7:
            return 0.5
        
        # 计算起床时间的标准差
        wake_hours = [int(t.split(":")[0]) for t in wake_times]
        variance = sum((h - sum(wake_hours)/len(wake_hours))**2 for h in wake_hours) / len(wake_hours)
        
        # 标准差越小，规律度越高
        regularity = max(0, 1 - (variance ** 0.5) / 3)
        return round(regularity, 2)


# 全局实例
analyzer = ActivityPatternAnalyzer()
profile_builder = UserProfileBuilder()
