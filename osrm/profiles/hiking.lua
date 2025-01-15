-- הגדרות בסיסיות לפרופיל הליכה
api_version = 4

Set = require('lib/set')
Sequence = require('lib/sequence')
Handlers = require("lib/way_handlers")
find_access_tag = require("lib/access").find_access_tag

function setup()
  return {
    properties = {
      max_speed_for_map_matching = 40/3.6, -- km/h
      weight_name = 'duration',
      weight_precision = 2,
      force_split_edges = true,
      call_tagless_node_function = false,
    },

    default_mode = mode.walking,
    default_speed = 4,
    oneway_handling = false,
    
    access_tag_whitelist = Set {
      'yes',
      'foot',
      'permissive',
      'designated'
    },

    access_tag_blacklist = Set {
      'no',
      'private',
      'agricultural',
      'forestry',
      'delivery'
    },

    restricted_access_tag_list = Set { },

    restricted_highway_whitelist = Set { },

    construction_whitelist = Set {},

    access_tags_hierarchy = Sequence {
      'foot',
      'access'
    },

    -- תגיות שבילים מועדפים
    hiking_paths = Set {
      'path',
      'footway',
      'track',
      'trail'
    },

    -- רמות קושי מותרות
    allowed_sac_scale = Set {
      'hiking',
      'mountain_hiking',
      'demanding_mountain_hiking'
    }
  }
end

function process_way(profile, way, result)
  -- בדיקת תגיות גישה בסיסיות
  local access = find_access_tag(way, profile.access_tags_hierarchy)
  if access and profile.access_tag_blacklist[access] then
    return
  end

  -- קבלת סוג הדרך
  local highway = way:get_value_by_key("highway")
  local route = way:get_value_by_key("route")
  local sac_scale = way:get_value_by_key("sac_scale")

  -- בדיקה אם זה שביל הליכה מסומן
  local is_hiking_path = profile.hiking_paths[highway] or route == 'hiking'
  
  -- בדיקת רמת קושי
  local valid_difficulty = not sac_scale or profile.allowed_sac_scale[sac_scale]

  -- קביעת מהירות ומשקל
  if is_hiking_path and valid_difficulty then
    -- מהירות גבוהה יותר לשבילים מסומנים
    if route == 'hiking' then
      result.forward_speed = 5
      result.backward_speed = 5
    else
      result.forward_speed = 4
      result.backward_speed = 4
    end
    
    -- משקל נמוך יותר לשבילים מסומנים
    result.forward_rate = 1
    result.backward_rate = 1
  else
    -- חסימת דרכים שאינן שבילי הליכה
    result.forward_mode = mode.inaccessible
    result.backward_mode = mode.inaccessible
  end
end

function process_turn(profile, turn) 
  turn.duration = 0
  turn.weight = 0
end

return {
  setup = setup,
  process_way = process_way,
  process_turn = process_turn
}
