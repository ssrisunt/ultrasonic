examplars= [
    {
        "current_date": "2020-12-01",
        "table_name": "Content Library Product",
        "fields_list": """["Department", "Module", "Username", "Access Count", "Number_of_Visitors", "Access Duration", "Data Date"]""",
        "question": "Compare the access count of jackjchen and robinlee in the content library",
        "prior_schema_links": """['jackjchen'->Username, 'robinlee'->Username]""",
        "analysis": """Let's think step by step. In the question "Compare the access count of jackjchen and robinlee in the content library", we are asked:
    "Compare jackjchen and robinlee", so we need column=[Username], cell values = ['jackjchen', 'robinlee'], so there is [Username:('jackjchen', 'robinlee')]
    "Access count in the content library", so we need column=[Access Count]""",
        "schema_links": """["Username":("'jackjchen'", "'robinlee'"), "Access Count"]""",
        "sql": """select Username, Access Count from Content_Library_Product where Username in ('jackjchen', 'robinlee')"""
    },
    {
        "current_date": "2022-11-06",
        "table_name": "Content Library Product",
        "fields_list": """["Department", "Module", "Username", "Access Count", "Number_of_Visitors", "Access Duration", "Data Date"]""",
        "question": "Number_of_Visitors to the content library in the past 12 months by department",
        "prior_schema_links": """[]""",
        "analysis": """Let's think step by step. In the question "Number_of_Visitors to the content library in the past 12 months by department", we are asked:
    "Content library in the past 12 months", so we need column=[Data Date], cell values = [12], so there is [Data Date:(12)]
    "Number_of_Visitors", so we need column=[Number_of_Visitors]
    "By department", so we need column=[Department]""",
        "schema_links": """["Data Date":(12), "Number_of_Visitors", "Department"]""",
        "sql": """select Department, Data Date, Number_of_Visitors from Content_Library_Product where datediff('month', Data Date, '2022-11-06') <= 12 """
    },
    { "current_date":"2023-04-21",
      "table_name":"Content Library Products",
      "fields_list":"""["department", "module", "username", "number of visits", "Number_of_Visitors", "duration of visits", "data date"]""",
      "question":"The access duration of the content library art department and technology research and development department",
      "prior_schema_links":"""['Art Department'->
department, 'Technology R&D Department'->
department]""",
      "analysis": """Let's think about it step by step. In the question "Duration of visits to the Content Library Art Department and Technology R&D Department", we were asked:
"Access duration", so we need column=[Access duration]
"Content library art department, technology research and development department", so we need column=[
department], cell values = ['Art Department', 'Technology R&D Department'], so there are [
department:('Art Department', 'Technology R&D Department')]""",
      "schema_links":"""["Access duration", "department":("'Art Department'", "'Technology R&D Department'")]""",
      "sql":"""select department, visit_duration from Content_Library_Product where department in ('Art Department', 'Technology R&D Department')"""
      },
    {   "current_date":"2023-08-21",
        "table_name":"curated_products",
        "fields_list":"""["strict_selection_copyright", "paid_model", "settlement_playback_share", "settlement_playback_share_paid_user", "data_date"]""",
        "question":"In the past 3 days, the Haitian flying series MPPM settled the playback share",
        "prior_schema_links":"""['Haitian Fei series'->strict_selection_copyright]""",
        "analysis": """Let's think step by step. In the question 'last 3 days Haitian Fei series MPPM settlement playback share', we are asked about: 'MPPM settlement playback share', so we need column=[settlement_playback_share], 'Haitian Fei series', so we need column=[strict_selection_copyright], cell values = ['Haitian Fei series'], so we have [strict_selection_copyright:('Haitian Fei series')], 'last 3 days', so we need column=[data_date], cell values = [3], so we have [data_date:(3)]",
        "schema_links": ["settlement_playback_share","strict_selection_copyright:('Haitian Fei series')","data_date:(3)"]""",
        "sql": """select strict_selection_copyright, settlement_playback_share from curated_products where strict_selection_copyright = 'Haitian Fei series' and datediff('day', data_date, '2023-08-21') <= 3"""
        },
    {   "current_date":"2023-05-22",
        "table_name":"song_library",
        "fields_list":"""["is_trendy_song", "c_note_song_id", "c_note_song_mid", "song_title", "song_version", "language", "song_type", "cover_type", "mppm_song_id", "is_strict_selection_narrow_scope_song", "is_strict_selection_wide_scope_song", "settlement_playback_count", "operation_playback_count", "paid_user_name_settlement_playback_count", "historical_cumulative_settlement_playback_count", "operation_search_playback_count", "settlement_search_playback_count", "operation_complete_playback_count", "operation_push_playback_count", "last_7_days_replay_rate", "daily_average_search_playback_count", "data_date"]""",
        "question":"Compare the playback count of cover versions and instrumental songs in the last 7 days",
        "prior_schema_links":"""['instrumental'->language, 'cover_version'->song_version]""",
        "analysis": """Let's think step by step. In the question 'Compare the playback count of cover versions and instrumental songs in the last 7 days', we are asked about: 'song playback count', so we need column=[settlement_playback_count], 'cover version', so we need column=[song_version], cell values = ['cover_version'], so we have [song_version:('cover_version')], 'and instrumental songs', so we need column=[language], cell values = ['instrumental'], so we have [language:('instrumental')], 'last 7 days', so we need column=[data_date], cell values = [7], so we have [data_date:(7)]""",
        "schema_links":"""["settlement_playback_count", "song_version:('cover_version')", "language:('instrumental')", "data_date:(7)"]""",
        "sql":"""select song_version, language, settlement_playback_count from song_library where song_version = 'cover_version' and language = 'instrumental' and datediff('day', data_date, '2023-05-22') <= 7"""
        },
    {   "current_date":"2023-05-31",
        "table_name":"artist_library",
        "fields_list":"""["availability_status", "artist_name", "artist_level", "artist_type", "artist_origin", "mppm_trendy_person_level", "active_region", "age", "artist_talent", "artist_style", "fan_count", "trendy_sound_fan_count", "ultrasound_fan_count", "promoted_post_fan_count", "ultrasound_song_count", "available_song_count", "ultrasound_share_count", "exclusive_song_count", "ultrasound_available_song_comments", "songs_with_playback_count", "data_date"]""",
        "question":"Compare the fan count of Chen Zhuoxuan, Meng Meiqi, and Lai Mei Yun",
        "prior_schema_links":"""['1527896'->mppm_artist_id, '1565463'->mppm_artist_id, '2141459'->mppm_artist_id]""",
        "analysis": """Let's think step by step. In the question 'Compare the fan count of Chen Zhuoxuan, Meng Meiqi, and Lai Mei Yun', we are asked about: 'fan count', so we need column=[fan_count], 'Chen Zhuoxuan, Meng Meiqi, Lai Mei Yun', so we need column=[artist_name], cell values = ['Chen Zhuoxuan', 'Meng Meiqi', 'Lai Mei Yun'], so we have [artist_name:('Chen Zhuoxuan', 'Meng Meiqi', 'Lai Mei Yun')]""",
                                                                                                                                                                                                                                                                                                                                                                                                                     "schema_links":"""["fan_count", "artist_name":("'Chen Zhuoxuan'", "'Meng Meiqi'", "'Lai Mei Yun'")]""",
"sql":"""select artist_name, fan_count from artist_library where artist_name in ('Chen Zhuoxuan', 'Meng Meiqi', 'Lai Mei Yun')"""
},
{   "current_date":"2023-07-31",
    "table_name":"song_library",
    "fields_list":"""["song_title", "song_version", "song_type", "mppm_song_id", "is_strict_selection_narrow_scope_song", "is_strict_selection_wide_scope_song", "is_trendy_song", "超声波歌曲ID", "c_note_song_id", "c_note_song_mid", "settlement_playback_count", "operation_playback_count", "share_count", "collection_count", "operation_search_playback_count", "settlement_search_playback_count", "new_user_count", "active_user_count", "share_rate", "settlement_playback_share", "data_date"]""",
    "question":"How many songs have a playback count greater than 10,000?",
    "prior_schema_links":"""[]""",
    "analysis": """Let's think step by step. In the question 'How many songs have a playback count greater than 10,000?', we are asked about: 'how many songs', so we need column=[song_title], 'playback count greater than 10,000', so we need column=[settlement_playback_count], cell values = [10000], so we have [settlement_playback_count:(10000)]""",
"schema_links":"""["song_title", "settlement_playback_count":(10000)]""",
"sql":"""select song_title from song_library where settlement_playback_count > 10000"""
},
{   "current_date":"2023-07-31",
    "table_name":"content_library_products",
    "fields_list":"""["user_name", "department", "module", "duration_of_visits", "number_of_visitors", "number_of_visitors", "data_date"]""",
    "question":"""Which user names from the Art Department in the content library have a visit duration of less than 1 hour?""",
    "prior_schema_links":"""['Art Department'->department]""",
    "analysis": """Let's think step by step. In the question 'Which user names from the Art Department in the content library have a visit duration of less than 1 hour?', we are asked about: 'which user names', so we need column=[user_name], 'from the Art Department', so we need column=[department], cell values = ['Art Department'], so we have [department:('Art Department')], 'visit duration of less than 1 hour', so we need column=[duration_of_visits], cell values = [1], so we have [duration_of_visits:(1)]""",
    "schema_links":"""["user_name", "department":("'Art Department'"), "duration_of_visits":(1)]""",
    "sql":"""select user_name from content_library_products where department = 'Art Department' and visit_duration< 1"""
    },
{
    "current_date": "2023-08-31",
    "table_name": "content_library_products",
    "fields_list": """["user_name", "department", "module", "duration_of_visits", "number_of_visitors", "data_date"]""",
    "question": """Which user names in the content library have the highest page views (PV)?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'Which user names in the content library have the highest page views (PV)?', we are asked about: 'which user names', so we need column=[user_name], 'with the highest page views (PV)', so we need column=[number_of_visitors], so we have [number_of_visitors:(1)]""",
    "schema_links": """["user_name", "number_of_visitors":(1)]""",
    "sql": """select user_name from content_library_products order by number_of_visitors desc limit 1"""
},
{
    "current_date": "2023-08-31",
    "table_name": "artist_library",
    "fields_list": """["playback_level", "playback_monotonicity", "playback_variance", "sudden_increase_type", "playback_concentration", "artist_name", "artist_rank", "artist_type", "artist_source", "mppm_trendy_person_rank", "settlement_playback_count", "operation_playback_count", "historical_cumulative_settlement_playback_count", "songs_with_playback_count", "historical_cumulative_operation_playback_count", "paid_user_name_settlement_playback_count", "settlement_playback_ratio", "operation_playback_share", "free_user_name_settlement_playback_ratio", "complete_playback_count", "data_date"]""",
    "question": """What is the average playback count for Yuan Yawei in the last 90 days?""",
    "prior_schema_links": """['152789226'->mppm_artist_id]""",
    "analysis": """Let's think step by step. In the question 'What is the average playback count for Yuan Yawei in the last 90 days?', we are asked about: 'average playback count', so we need column=[settlement_playback_count], 'Yuan Yawei', so we need column=[artist_name], cell values = ['Yuan Yawei'], so we have [artist_name:('Yuan Yawei')], 'last 90 days', so we need column=[data_date], cell values = [90], so we have [data_date:(90)]""",
    "schema_links": """["settlement_playback_count", "artist_name":("'Yuan Yawei'"), "data_date":(90)]""",
    "sql": """select avg(settlement_playback_count) from artist_library where artist_name = 'Yuan Yawei' and datediff('day', data_date, '2023-08-31') <= 90 """
},
{
    "current_date": "2023-08-31",
    "table_name": "artist_library",
    "fields_list": """["playback_level", "playback_monotonicity", "playback_variance", "sudden_increase_type", "playback_concentration", "artist_name", "artist_rank", "artist_type", "artist_source", "mppm_trendy_person_rank", "settlement_playback_count", "operation_playback_count", "historical_cumulative_settlement_playback_count", "songs_with_playback_count", "historical_cumulative_operation_playback_count", "paid_user_name_settlement_playback_count", "settlement_playback_ratio", "operation_playback_share", "free_user_name_settlement_playback_ratio", "complete_playback_count", "data_date"]""",
    "question": """What is the total settlement_playback_count for Zhou Qianqian in the last 7 days?""",
    "prior_schema_links": """['199509'->mppm_artist_id]""",
    "analysis": """Let's think step by step. In the question 'What is the total settlement_playback_count for Zhou Qianqian in the last 7 days?', we are asked about: 'total settlement_playback_count', so we need column=[settlement_playback_count], 'Zhou Qianqian', so we need column=[artist_name], cell values = ['Zhou Qianqian'], so we have [artist_name:('Zhou Qianqian')], 'last 7 days', so we need column=[data_date], cell values = [7], so we have [data_date:(7)]""",
    "schema_links": """["settlement_playback_count", "artist_name":("'Zhou Qianqian'"), "data_date":(7)]""",
    "sql": """select sum(settlement_playback_count) from artist_library where artist_name = 'Zhou Qianqian' and datediff('day', data_date, '2023-08-31') <= 7 """
},
{
    "current_date": "2023-09-14",
    "table_name": "content_library_products",
    "fields_list": """["department", "module", "user_name", "number_of_visitors", "number_of_visitors", "duration_of_visits", "data_date"]""",
    "question": """Which departments in the content library have more than 1k visitors?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'Which departments in the content library have more than 1k visitors?', we are asked: 'Which departments', so we need column=[department]. 'More than 1k visitors', so we need column=[number_of_visitors], cell values = [1000], so we have [number_of_visitors:(1000)]""",
    "schema_links": """["department", "number_of_visitors":(1000)]""",
    "sql": """select department from content_library_products where number_of_visitors > 1000"""
},
{
    "current_date": "2023-09-18",
    "table_name": "song_library",
    "fields_list": """["song_title", "mppm_artist_id", "song_version", "song_type", "mppm_song_id", "is_strict_selection_narrow_scope_song", "is_strict_selection_wide_scope_song", "is_trendy_song", "ultrasound_song_id", "c_note_song_id", "c_note_song_mid", "settlement_playback_count", "operation_playback_count", "share_count", "collection_count", "operation_search_playback_count", "settlement_search_playback_count", "new_user_count", "active_user_count", "share_rate", "settlement_playback_share", "data_date"]""",
    "question": """Which songs titled 'Brave One' sung by 'Chen Yixun' have more than 20k playback count?""",
    "prior_schema_links": """['199509'->mppm_artist_id, '1527123'->mppm_song_id]""",
    "analysis": """Let's think step by step. In the question 'Which songs titled 'Brave One' sung by 'Chen Yixun' have more than 20k playback count?', we are asked: 'Which songs titled 'Brave One'', so we need column=[song_title], cell values = ['Brave One'], so we have [song_title:('Brave One')] 'More than 20k playback count', so we need column=[settlement_playback_count], cell values = [20000], so we have [settlement_playback_count:(20000)] 'Sung by 'Chen Yixun'', so we need column=[artist_name], cell values = ['Chen Yixun'], so we have [artist_name:('Chen Yixun')]""",
    "schema_links": """["song_title":("'Brave One'"), "settlement_playback_count":(20000), "artist_name":("'Chen Yixun'")]""",
    "sql": """select song_title from song_library where settlement_playback_count > 20000 and artist_name = 'Chen Yixun' and song_title = 'Brave One'"""
},
{
    "current_date": "2023-09-18",
    "table_name": "song_library",
    "fields_list": """["song_title", "song_version", "artist_name", "song_type", "release_date", "mppm_song_id", "is_strict_selection_narrow_scope_song", "is_strict_selection_wide_scope_song", "is_trendy_song", "ultrasound_song_id", "c_note_song_id", "c_note_song_mid", "settlement_playback_count", "operation_playback_count", "share_count", "collection_count", "operation_search_playback_count", "settlement_search_playback_count", "new_user_count", "active_user_count", "share_rate", "settlement_playback_share", "data_date"]""",
    "question": """Which songs were released by Zhou Jieliun last year?""",
    "prior_schema_links": """['23109'->mppm_artist_id]""",
    "analysis": """Let's think step by step. In the question 'Which songs were released by Zhou Jieliun last year?', we are asked: 'Which songs', so we need column=[song_title] 'Released last year', so we need column=[release_date], cell values = [1], so we have [release_date:(1)] 'By Zhou Jieliun', so we need column=[artist_name], cell values = ['Zhou Jieliun'], so we have [artist_name:('Zhou Jieliun')]""",
    "schema_links": """["song_title", "release_date":(1), "artist_name":("'Zhou Jieliun'")]""",
    "sql": """select song_title from song_library where datediff('year', release_date, '2023-09-18') <= 1 and artist_name = 'Zhou Jieliun'"""
},
{
    "current_date": "2023-09-11",
    "table_name": "artist_library",
    "fields_list": """["playback_level", "playback_monotonicity", "playback_variance", "playback_surge_type", "playback_concentration", "artist_name", "artist_rank", "artist_type", "artist_source", "signing_date", "MPPM_trendy_person_rank", "settlement_playback_count", "operation_playback_count", "historical_cumulative_settlement_playback_count", "songs_with_playback_count", "historical_cumulative_operation_playback_count", "paid_user_name_settlement_playback_count", "settlement_playback_percentage", "operation_playback_share", "free_user_name_settlement_playback_percentage", "complete_playback_count", "data_date"]""",
    "question": """Which artists, who have signed in the last six months, are in the top ten for playback count?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'Which artists, who have signed in the last six months, are in the top ten for playback count?', we are asked: 'Which artists', so we need column=[artist_name] 'Top ten for playback count', so we need column=[settlement_playback_count], cell values = [10], so we have [settlement_playback_count:(10)] 'Who have signed in the last six months', so we need column=[signing_date], cell values = [0.5], so we have [signing_date:(0.5)]""",
    "schema_links": """["artist_name", "settlement_playback_count":(10), "signing_date":(0.5)]""",
    "sql": """select artist_name from artist_library where datediff('month', signing_date, '2023-09-11') <= 6 order by settlement_playback_count desc limit 10"""
},
{
    "current_date": "2023-08-12",
    "table_name": "song_library",
    "fields_list": """["release_date", "song_language", "song_source", "song_genre", "song_title", "song_version", "song_type", "release_time", "data_date"]""",
    "question": """Which songs released in the past year have had over 10 million plays in the last 7 days?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'Which songs released in the past year have had over 10 million plays in the last 7 days?', we are asked: 'Which songs released', so we need column=[song_title] 'in the past year', so we need column=[release_date], cell values = [1], so we have [release_date:(1)] 'have had over 10 million plays in the last 7 days', so we need column=[data_date, settlement_playback_count], cell values = [7, 10000000], so we have [data_date:(7), settlement_playback_count:(10000000)]""",
    "schema_links": """["song_title", "release_date":(1), "data_date":(7), "settlement_playback_count":(10000000)]""",
    "sql": """select song_title from song_library where datediff('year', release_date, '2023-08-12') <= 1 and datediff('day', data_date, '2023-08-12') <= 7 and settlement_playback_count > 10000000"""
},
{
    "current_date": "2023-08-12",
    "table_name": "song_library",
    "fields_list": """["release_date", "song_language", "song_source", "song_genre", "song_title", "song_version", "song_type", "release_time", "data_date"]""",
    "question": """Which songs released this year have had over 10 million plays in the last 7 days?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'Which songs released this year have had over 10 million plays in the last 7 days?', we are asked: 'Which songs released', so we need column=[song_title] 'released this year', so we need column=[release_date], cell values = [0], so we have [release_date:(0)] 'have had over 10 million plays in the last 7 days', so we need column=[data_date, settlement_playback_count], cell values = [7, 10000000], so we have [data_date:(7), settlement_playback_count:(10000000)]""",
    "schema_links": """["song_title", "release_date":(0), "data_date":(7), "settlement_playback_count":(10000000)]""",
    "sql": """select song_title from song_library where datediff('year', release_date, '2023-08-12') <= 0 and datediff('day', data_date, '2023-08-12') <= 7 and settlement_playback_count > 10000000"""
},
{
    "current_date": "2023-08-12",
    "table_name": "song_library",
    "fields_list": """["release_date", "song_language", "song_source", "song_genre", "song_title", "song_version", "song_type", "release_time", "data_date"]""",
    "question": """Which songs released since 2023 have had over 10 million plays in the last 7 days?""",
    "prior_schema_links": """['514129144'->MPPM_song_ID]""",
    "analysis": """Let's think step by step. In the question 'Which songs released since 2023 have had over 10 million plays in the last 7 days?', we are asked: 'Which songs released', so we need column=[song_title] 'released since 2023', so we need column=[release_date], cell values = ['2023-01-01'], so we have [release_date:('2023-01-01')] 'have had over 10 million plays in the last 7 days', so we need column=[data_date, settlement_playback_count], cell values = [7, 10000000], so we have [data_date:(7), settlement_playback_count:(10000000)]""",
    "schema_links": """["song_title", "release_date":("'2023-01-01'"), "data_date":(7), "settlement_playback_count":(10000000)]""",
    "sql": """select song_title from song_library where release_date >= '2023-01-01' and datediff('day', data_date, '2023-08-12') <= 7 and settlement_playback_count > 10000000"""
},
{
    "current_date": "2023-08-01",
    "table_name": "song_library",
    "fields_list": """["song_title", "song_version", "artist_name", "song_type", "release_date", "mppm_song_id", "is_strict_selection_narrow_scope_song", "is_strict_selection_wide_scope_song", "is_trendy_song", "ultrasound_song_ID", "c_note_song_id", "c_note_song_mid", "settlement_playback_count", "operation_playback_count", "share_count", "collection_count", "operation_search_playback_count", "settlement_search_playback_count", "new_user_count", "active_user_count", "share_rate", "settlement_playback_share", "data_date"]""",
    "question": """Which songs did Zhou Jielun release after June 2023?""",
    "prior_schema_links": """['23109'->mppm_artist_id]""",
    "analysis": """Let's think step by step. In the question 'Which songs did Zhou Jielun release after June 2023?', we are asked: 'Which songs', so we need column=[song_title] 'released after June 2023', so we need column=[release_date], cell values = ['2023-06-01'], so we have [release_date:('2023-06-01')] 'Zhou Jielun', so we need column=[artist_name], cell values = ['Zhou Jielun'], so we have [artist_name:('Zhou Jielun')]""",
    "schema_links": """["song_title", "release_date":("'2023-06-01'"), "artist_name":("'Zhou Jielun'")]""",
    "sql": """select song_title from song_library where release_date >= '2023-06-01' and artist_name = 'Zhou Jielun'"""
},

{
    "current_date": "2023-08-01",
    "table_name": "song_library",
    "fields_list": """["song_title", "song_version", "artist_name", "song_type", "release_date", "mppm_song_id", "is_strict_selection_narrow_scope_song", "is_strict_selection_wide_scope_song", "is_trendy_song", "ultrasound_song_ID", "c_note_song_id", "c_note_song_mid", "settlement_playback_count", "operation_playback_count", "share_count", "collection_count", "operation_search_playback_count", "settlement_search_playback_count", "new_user_count", "active_user_count", "share_rate", "settlement_playback_share", "data_date"]""",
    "question": """Which songs released by Deng Ziqi after January 5, 2023, have a playback count greater than 5 million?""",
    "prior_schema_links": """['2312311'->mppm_artist_id]""",
    "analysis": """Let's think step by step. In the question 'Which songs released by Deng Ziqi after January 5, 2023, have a playback count greater than 5 million?', we are asked: 'playback count greater than 5 million', so we need column=[settlement_playback_count], cell values = [5000000], so we have [settlement_playback_count:(5000000)] 'released by Deng Ziqi after January 5, 2023', so we need column=[release_date], cell values = ['2023-01-05'], so we have [release_date:('2023-01-05')] 'Deng Ziqi', so we need column=[artist_name], cell values = ['Deng Ziqi'], so we have [artist_name:('Deng Ziqi')]""",
    "schema_links": """["song_title", "release_date":("'2023-01-05'"), "artist_name":("'Deng Ziqi'"), "settlement_playback_count":(5000000)]""",
    "sql": """select song_title from song_library where release_date >= '2023-01-05' and artist_name = 'Deng Ziqi' and settlement_playback_count > 5000000"""
},
{
    "current_date": "2023-09-17",
    "table_name": "song_library",
    "fields_list": """["song_title", "song_version", "artist_name", "song_type", "release_date", "mppm_song_id", "is_strict_selection_narrow_scope_song", "is_strict_selection_wide_scope_song", "is_trendy_song", "ultrasound_song_ID", "c_note_song_id", "c_note_song_mid", "settlement_playback_count", "operation_playback_count", "share_count", "collection_count", "operation_search_playback_count", "settlement_search_playback_count", "new_user_pull", "active_user_pull", "share_rate", "settlement_playback_share", "data_date"]""",
    "question": """Which songs by Zhang Liangying released after June 2023 have a playback count greater than 2 million?""",
    "prior_schema_links": """['45453'->mppm_artist_id]""",
    "analysis": """Let's think step by step. In the question 'Which songs by Zhang Liangying released after June 2023 have a playback count greater than 2 million?', we are asked: 'playback count greater than 2 million', so we need column=[settlement_playback_count], cell values = [2000000], so we have [settlement_playback_count:(2000000)] 'released after June 2023 by Zhang Liangying', so we need column=[data_date, artist_name], cell values = ['2023-06-01', 'Zhang Liangying'], so we have [data_date:('2023-06-01'), artist_name:('Zhang Liangying')], 'Which songs', so we need column=[song_title]""",
    "schema_links": """["song_title", "settlement_playback_count":(2000000), "data_date":("'2023-06-01'"), "artist_name":("'Zhang Liangying'")]""",
    "sql": """select song_title from song_library where data_date >= '2023-06-01' and artist_name = 'Zhang Liangying' and settlement_playback_count > 2000000"""
},
{
    "current_date": "2023-08-16",
    "table_name": "song_library",
    "fields_list": """["song_title", "song_version", "artist_name", "song_type", "release_date", "mppm_song_id", "is_strict_selection_narrow_scope_song", "is_strict_selection_wide_scope_song", "is_trendy_song", "ultrasound_song_ID", "c_note_song_id", "c_note_song_mid", "settlement_playback_count", "operation_playback_count", "share_count", "collection_count", "operation_search_playback_count", "settlement_search_playback_count", "new_user_pull", "active_user_pull", "share_rate", "settlement_playback_share", "data_date"]""",
    "question": """Which songs by Liu Yehua released between April 2, 1992, and May 2, 2020, have a playback count greater than 200,000?""",
    "prior_schema_links": """['4234234'->mppm_artist_id]""",
    "analysis": """Let's think step by step. In the question 'Which songs by Liu Yehua released between April 2, 1992, and May 2, 2020, have a playback count greater than 200,000?', we are asked: 'playback count greater than 200,000', so we need column=[settlement_playback_count], cell values = [200000], so we have [settlement_playback_count:(200000)] 'released between April 2, 1992, and May 2, 2020 by Liu Yehua', so we need column=[release_date, artist_name], cell values = ['1992-04-02', '2020-05-02'], so we have [release_date:('1992-04-02', '2020-05-02'), artist_name:('Liu Yehua')]""",
    "schema_links": """["song_title", "settlement_playback_count":(200000), "release_date":("'1992-04-02'", "'2020-05-02'"), "artist_name":("'Liu Yehua'")]""",
    "sql": """select song_title from song_library where release_date >= '1992-04-02' and release_date <= '2020-05-02' and artist_name = 'Liu Yehua' and settlement_playback_count > 200000"""
},
{
    "current_date": "2023-09-04",
    "table_name": "content_library_products",
    "fields_list": """["user_name", "department", "module", "duration_of_visits", "number_of_visitors", "number_of_visitors", "data_date"]""",
    "question": """What is the average number of visitors in the content library for the past 30 days?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'What is the average number of visitors in the content library for the past 30 days?', we are asked: 'average number of visitors', so we need column=[number_of_visitors] 'in the content library for the past 30 days', so we need column=[data_date], cell values = [30], so we have [data_date:(30)]""",
    "schema_links": """["number_of_visitors", "data_date":(30)]""",
    "sql": """select avg(number_of_visitors) from content_library_products where datediff('day', data_date, '2023-09-04') <= 30 """
},
{
    "current_date": "2023-09-04",
    "table_name": "content_library_products",
    "fields_list": """["user_name", "department", "module", "duration_of_visits", "number_of_visitors", "number_of_visitors", "data_date"]""",
    "question": """Which month in the past half year had the highest total number of visitors in the content library?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'Which month in the past half year had the highest total number of visitors in the content library?', we are asked: 'highest total number of visitors', so we need column=[number_of_visitors], cell values = [1], so we have [number_of_visitors:(1)] 'in the content library for the past half year', so we need column=[data_date], cell values = [0.5], so we have [data_date:(0.5)]""",
    "schema_links": """["number_of_visitors":(1), "data_date":(0.5)]""",
    "sql": """select MONTH(data_date), sum(number_of_visitors) from content_library_products where datediff('year', data_date, '2023-09-04') <= 0.5 group by MONTH(data_date) order by sum(number_of_visitors) desc limit 1"""
},
{
    "current_date": "2023-09-04",
    "table_name": "content_library_products",
    "fields_list": """["user_name", "department", "module", "duration_of_visits", "number_of_visitors", "number_of_visitors", "data_date"]""",
    "question": """What is the average number of visitors per month in the content library for the past half year?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'What is the average number of visitors per month in the content library for the past half year?', we are asked: 'average number of visitors per month', so we need column=[number_of_visitors] 'in the content library for the past half year', so we need column=[data_date], cell values = [0.5], so we have [data_date:(0.5)]""",
    "schema_links": """["number_of_visitors", "data_date":(0.5)]""",
    "sql": """select MONTH(data_date), avg(number_of_visitors) from content_library_products where datediff('year', data_date, '2023-09-04') <= 0.5 group by MONTH(data_date)"""
},
{
    "current_date": "2023-09-10",
    "table_name": "content_library_products",
    "fields_list": """["user_name", "department", "module", "duration_of_visits", "number_of_visitors", "number_of_visitors", "data_date"]""",
    "question": """Which are the top 10 departments in the content library based on the number of visitors?""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'Which are the top 10 departments in the content library based on the number of visitors?', we are asked: 'top 10 departments based on the number of visitors', so we need column=[number_of_visitors], cell values = [10], so we have [number_of_visitors:(10)] 'in the content library grouped by department', so we need column=[department]""",
    "schema_links": """["number_of_visitors":(10), "department"]""",
    "sql": """select
        department, sum(number_of_visitors) from content_library_products group by
        department order by sum(number_of_visitors) desc limit 10"""
},
{
    "current_date":"2023-09-10",
    "table_name":"content_library_products",
    "fields_list":"""["user_name", "department", "module", "duration_of_visits", "number_of_visitors", "number_of_visitors", "data_date"]""",
    "question":"超音速 近7个月，月度总访问量超过 2万的月份",
    "prior_schema_links":"""[]""",
    "analysis": """让我们一步一步地思考。在问题“超音速 近7个月，月度总访问量超过 2万的月份“中，我们被问：
“月度总访问量超过 2万的月份”，所以我们需要column=[number_of_visitors], cell values = [20000],所以有[number_of_visitors:(20000)]
”超音速 近7个月“，所以我们需要column=[data_date], cell values = [7],所以有[data_date:(7)]""",
    "schema_links":"""["number_of_visitors":(20000), "data_date":(7)]""",
    "sql":"""select MONTH(data_date) from content_library_products where datediff('day', data_date, '2023-09-10') <= 7 group by MONTH(data_date) having sum(number_of_visitors) > 20000"""
},
{
    "current_date": "2023-09-10",
    "table_name": "song_library",
    "fields_list": """["song_language", "song_source", "operation_playback_count", "playback_count", "song_name", "settlement_playback_count", "album_name", "release_date", "song_version", "song_type", "data_date"]""",
    "question": """For songs released between July 2022 and July 2023, rank by playback count and take the top 100, then aggregate the operational playback count by month for the past year.""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'For songs released between July 2022 and July 2023, rank by playback count and take the top 100, then aggregate the operational playback count by month for the past year.', we are asked: 'aggregate the operational playback count by month for the past year', so we need column=[operation_playback_count, data_date], cell values = [1], so we have [operation_playback_count, data_date:(1)] 'rank by playback count and take the top 100', so we need column=[playback_count], cell values = [100], so we have [playback_count:(100)] 'For songs released between July 2022 and July 2023', so we need column=[release_date], cell values = ['2022-07-01', '2023-07-01'], so we have [release_date:('2022-07-01', '2023-07-01')]""",
    "schema_links": """["operation_playback_count", "data_date":(1), "playback_count":(100), "release_date":("'2022-07-01'", "'2023-07-01'")]""",
    "sql": """select MONTH(data_date), sum(operation_playback_count) from (select data_date, operation_playback_count from song_library where release_date >= '2022-07-01' and release_date <= '2023-07-01' order by playback_count desc limit 100) t where datediff('year', data_date, '2023-09-10') <= 1 group by MONTH(data_date)"""
},
{
    "current_date": "2023-09-10",
    "table_name": "song_library",
    "fields_list": """["song_language", "song_source", "operation_playback_count", "playback_count", "song_name", "settlement_playback_count", "album_name", "release_date", "song_version", "song_type", "data_date"]""",
    "question": """For songs released between July 2022 and July 2023, rank by playback count and take the top 100, then aggregate the operational playback count by month for the past year and filter months where the sum of operational playback count is greater than 2k.""",
    "prior_schema_links": """[]""",
    "analysis": """Let's think step by step. In the question 'For songs released between July 2022 and July 2023, rank by playback count and take the top 100, then aggregate the operational playback count by month for the past year and filter months where the sum of operational playback count is greater than 2k.', we are asked: 'filter months where the sum of operational playback count is greater than 2k', so we need column=[operation_playback_count], cell values = [2000], so we have [operation_playback_count:(2000)] 'aggregate the operational playback count by month for the past year', so we need column=[data_date], cell values = [1], so we have [data_date:(1)] 'rank by playback count and take the top 100', so we need column=[playback_count], cell values = [100], so we have [playback_count:(100)] 'For songs released between July 2022 and July 2023', so we need column=[release_date], cell values = ['2022-07-01', '2023-07-01'], so we have [release_date:('2022-07-01', '2023-07-01')]""",
    "schema_links": """["operation_playback_count":(2000), "data_date":(1), "playback_count":(100), "release_date":("'2022-07-01'", "'2023-07-01'")]""",
    "sql": """select MONTH(data_date), sum(operation_playback_count) from (select data_date, operation_playback_count from song_library where release_date >= '2022-07-01' and release_date <= '2023-07-01' order by playback_count desc limit 100) t where datediff('year', data_date, '2023-09-10') <= 1 group by MONTH(data_date) having sum(operation_playback_count) > 2000"""
}

]