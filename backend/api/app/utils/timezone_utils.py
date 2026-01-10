from datetime import datetime
try:
    from zoneinfo import ZoneInfo
except ImportError:
    from backports.zoneinfo import ZoneInfo

class TimezoneManager:
    # Basic US State to Timezone mapping
    STATE_TIMEZONE_MAP = {
        'AL': 'America/Chicago', 'AK': 'America/Anchorage', 'AZ': 'America/Phoenix',
        'AR': 'America/Chicago', 'CA': 'America/Los_Angeles', 'CO': 'America/Denver',
        'CT': 'America/New_York', 'DE': 'America/New_York', 'DC': 'America/New_York',
        'FL': 'America/New_York', 'GA': 'America/New_York', 'HI': 'Pacific/Honolulu',
        'ID': 'America/Denver', 'IL': 'America/Chicago', 'IN': 'America/Indianapolis',
        'IA': 'America/Chicago', 'KS': 'America/Chicago', 'KY': 'America/New_York',
        'LA': 'America/Chicago', 'ME': 'America/New_York', 'MD': 'America/New_York',
        'MA': 'America/New_York', 'MI': 'America/Detroit', 'MN': 'America/Chicago',
        'MS': 'America/Chicago', 'MO': 'America/Chicago', 'MT': 'America/Denver',
        'NE': 'America/Chicago', 'NV': 'America/Los_Angeles', 'NH': 'America/New_York',
        'NJ': 'America/New_York', 'NM': 'America/Denver', 'NY': 'America/New_York',
        'NC': 'America/New_York', 'ND': 'America/Chicago', 'OH': 'America/New_York',
        'OK': 'America/Chicago', 'OR': 'America/Los_Angeles', 'PA': 'America/New_York',
        'RI': 'America/New_York', 'SC': 'America/New_York', 'SD': 'America/Chicago',
        'TN': 'America/Chicago', 'TX': 'America/Chicago', 'UT': 'America/Denver',
        'VT': 'America/New_York', 'VA': 'America/New_York', 'WA': 'America/Los_Angeles',
        'WV': 'America/New_York', 'WI': 'America/Chicago', 'WY': 'America/Denver'
    }

    def get_current_time_formatted(self, timezone_str: str = "America/New_York") -> str:
        """
        Get current time in the specified timezone, formatted as 'Day, Time AM/PM'.
        Example: 'Monday, 10:30 AM'
        """
        try:
            tz = ZoneInfo(timezone_str)
            now = datetime.now(tz)
            return now.strftime("%A, %I:%M %p")
        except Exception as e:
            print(f"Error getting time for timezone {timezone_str}: {e}")
            return datetime.now().strftime("%A, %I:%M %p")
