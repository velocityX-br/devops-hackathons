

```bash

#!/bin/bash

# ============================================================
# 用法: ./cqa_cal_domain.sh <user:password>
# 示例: ./cqa_cal_domain.sh 'myuser:mypassword'
# ============================================================

# --- 参数校验 ---
if [[ -z "$1" ]]; then
    echo "错误: 缺少认证参数" >&2
    echo "用法: $0 <user:password>" >&2
    exit 1
fi

# --- 公共变量 ---
readonly AUTH="$1"
readonly BASE_URL="https://gmp.cia.net.sap/cgi-bin/rest/rest.pl/cqa/v1/query/attributes"
readonly NAMESERVER="dns-api Hidden Primary"
readonly NAMESERVER_ENCODED="dns-api%20Hidden%20Primary"

# --- 函数: 查询第一个API，获取zone列表 ---
fetch_zones() {
    local query="DnsNameservers.with(name%20in%20(%22${NAMESERVER_ENCODED}%22))"
    local attrs="attributes=ident&attributes=name&attributes=creationTimestamp&attributes=catalog_zones&attributes=forward_zones&attributes=domains"
    local url="${BASE_URL}/?query=${query}&${attrs}"

    curl -s -u "$AUTH" "$url" \
        | jq -r '.DnsNameserver["dns-api Hidden Primary"].domains.DnsZone[]'
}

# --- 函数: 将zone列表构建为URL编码的 IN 查询条件 ---
# 输入: 换行分隔的zone名称
# 输出: %22zone1%22%2C%22zone2%22 格式的编码字符串
build_zone_filter() {
    local zones_input="$1"
    echo "$zones_input" \
        | awk 'NF { printf "%s%%22%s%%22", sep, $0; sep="%2C" } END { print "" }'
}

# --- 函数: 查询第二个API，批量获取zone统计信息 ---
fetch_zone_stats() {
    local zone_filter="$1"
    local query="DnsZones.with(name%20in%20(${zone_filter}))"
    local attrs="attributes=name&attributes=aliases_count&attributes=ips_count"
    local url="${BASE_URL}/?query=${query}&${attrs}"

    curl -s -u "$AUTH" "$url" \
        | jq -r '
            ["ZONE", "IPS_COUNT", "ALIASES_COUNT", "RECORD_TOTAL"],
            (
                .DnsZone
                | to_entries
                | sort_by(.value.ips_count + .value.aliases_count)
                | reverse[]
                | [
                    .key,
                    .value.ips_count,
                    .value.aliases_count,
                    (.value.ips_count + .value.aliases_count)
                  ]
            )
            | @tsv
        ' \
        | column -t
}

# ============================================================
# 主流程
# ============================================================

# Step 1: 获取zone列表
echo "正在查询 nameserver '${NAMESERVER}' 下的zone列表..." >&2
zones=$(fetch_zones)

if [[ -z "$zones" ]]; then
    echo "错误: 未查询到任何zone，请检查认证信息或API响应" >&2
    exit 2
fi

echo "查询到以下zones:" >&2
echo "$zones" | sed 's/^/  /' >&2
echo >&2

# Step 2: 构建zone过滤条件（批量处理，无需逐个循环）
zone_filter=$(build_zone_filter "$zones")

# Step 3: 批量查询zone统计并输出表格
echo "正在查询zone统计信息..." >&2
fetch_zone_stats "$zone_filter
```