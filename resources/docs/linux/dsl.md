# DSL

- [DSL简介](#dsl)
    - [_all & _search](#allsearch)
    - [_mapping](#_mapping)
    - [精确搜索和模糊搜索](#exactandfulltest)
    - [DSL类型](#dsl-type)
- [filter-dsl](#filter-dsl)
    - [term](#term)
    - [terms](#terms)
    - [range](#range)
    - [exists & missing](#exists&missing)
    - [bool](#bool)
    - [wildcard](#wildcard)
    - [filter](#filter)
- [query-dsl](#query-dsl)
    - [match](#match)
    - [高亮结果](#highlight)
    - [match_phrase](#match_phrase)
    - [muti_match](#muti_match)
- [aggs](#aggs)
    - [格式](#aggs-format)
    - [terms指定分组字段](#aggs-terms)
    


<a name='dsl'></a>
## DSL简介

DSL(Domain Specific Language领域特定语言)指定JSON做为请求体。

    simple term query, 域查询
    phrase
    range
    boolean
    fuzzy 模糊查询
    

<a name="allsearch"></a>
### _all & _search



对每一个文档，会取得其所有域的所有值，生成一个名为“_all”的域；执行查询时，如果在query_string未指定查询域，则在_all域上执行查询操作；


#### lucense简单字符串查询

默认情况下搜索会返回前10个结果, `size`默认值为10

格式 `[/index_name][/class_name]/_search?q='[field_name:]search_value'`
    
    # _all域搜索
    GET /_search   #显示所有, 尽量少用, 仅用测试环境
    GET /_search?q='Jing'
    
    GET /students/_search?q='guo'
    GET /students/class1/_search?q='Jing'&pretty
    # 多字段任意匹配其中一个, 得分高的在前
    GET students/_search?q=info:(boy)+last_name:(Jing)

指定查询域
    
    GET /students/_search?q=courses:'guo%20jing'


注意: 查询字符串必须通过urlencode, 如`空格`为%20, `+`为%2B, `:`为%3A, 但是这样的转换太晦涩难懂了

因为这些原因，我们不建议直接暴露查询字符串搜索给用户，除非这些用户对于你的数据和集群可信。

#### 复杂查询

构建包含请求体的DSL查询

    GET /students/class1/_search
    {
      "query":{
          "match": {
            "age": 27
          }
      }
    }

<a name="_mapping"></a>
### _mapping

映射(mapping)机制用于进行字段类型确认，将每个字段匹配为一种确定的数据类型( string , number , booleans ,date 等)。

Elasticsearch为对字段类型进行猜测,动态生成了字段和类型的映射关系, _all 因为是默认字段所以没有在此显示，不过我们知道它是 string 类型。

#### 查看索引映射Scheme

    GET /indices_name/_mapping/type_name

<a name="exactandfulltest"></a>
### 精确搜索和模糊搜索

确切值(Exact values) vs. 全文文本(Full text)

确切值是确定的，正如它的名字一样。比如一个date或用户ID，也可以包含更多的字符串比如username或email地址。

确切值 "Foo" 和 "foo" 就并不相同。确切值 2014 和 2014-09-15 也不相同。

    WHERE name = "John Smith"
    AND user_id = 2
    AND date > "2014-09-15"
    
全文文本，实际上自然语言是高度结构化的。  

而对于全文数据的查询来说，却有些微妙。我们不会去询问 这篇文档是否匹配查询要求？ 但是，我们会询问 这篇文档和查询的匹配程
度如何？换句话说，对于查询条件，这篇文档的`相关性`有多高？这个时候可能需要配合上一些相似度算法(similarity algorithm)

Elasticsearch使用一种叫做`倒排索引`(inverted index)的结构来做快速的全文搜索。倒排索引由在文档中出现的唯一的单词列
表，以及对于每个单词在文档中的位置组成。


<a name="dsl-type"></a>
### DSL类型

* query dsl：执行full-text查询时，基于相关度来`评判其匹配结果`；查询执行过程复杂，且`不会被缓存`；
* filter dsl：执行exact查询时，基于其结果为“yes”或“no”进行评判； 速度`快`，且`结果缓存`；

<a name='filter-dsl'></a>
## filter dsl

<a name="term"></a>
### term 过滤

term 主要用于精确匹配哪些值，比如数字，日期，布尔值或 not_analyzed 的字符串(未经分析的文本数据类型)

    { "term": { "age": 26 }}
    { "term": { "date": "2014-09-01" }}
    { "term": { "public": true }}
    { "term": { "tag": "full_text" }}

_mapping为`keyword`类型

多个term条件

    {
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "name": "Rice"
              }
            },
            {
              "term": {
                "countryCode": "BR"
              }
            }
          ]
        }
      }
    }

<a name="terms"></a>
### terms 过滤

terms 跟 term 有点类似，但 terms 允许指定多个匹配条件。 如果某个字段指定了多个值，那么文档需要一起去做匹配,：

    {
        "terms": {
            "tag": [ "search", "full_text", "nosql" ]
        }
    }


<a name="range"></a>
### range 过滤

range 过滤允许我们按照指定范围查找一批数据：


    {
        "range": {
            "age": {
                "gte": 20,
                "lt": 30
            }
        }
    }

适用于mapping为日期的mapping

    {
      "range": {
        "born_at": {
          "gte": "1990-01-01 00:00:00",
          "lt": "1991-01-01 00:00:00"
        }
      }
    }

<a name="exists&missing"></a>
### exists & missing

`exists` 和 `missing` 过滤可以用于查找文档中`是否包含指定字段`或没有某个字段，类似于SQL语句中的 `IS_NUL`L 条件

简单而言, 就是判断字段是否存在, 而不是值是否为null

    {
        "exists": {
            "field": "title"
        }
    }

schemefree的需要, 结构可能是不统一的

<a name="wildcard"></a>
### wildcard

类似like的正则过滤

    GET students/_search
    {
      "query": {
        "bool": {
          "must": [
            {
              "wildcard": {
                "name": "R*"
              }
            },
            {
              "wildcard": {
                "name": {
                  "value": "*r"
                }
              }
            }
          ]
        }
      }
    }

<a name="bool"></a>
### bool

bool: 过滤可以用来合并多个过滤条件查询结果的布尔逻辑，它包含一下操作符：

must: 多个查询条件的完全匹配,相当于 and 。

must_not: 多个查询条件的相反匹配，相当于 not 。

should: 至少有一个查询条件匹配, 相当于 or 。 `"minimum_should_match": 1`可选

filter: 不同于前面四项, 不计算相得分, 注意简单过滤结构化数据, 如时间段, 状态是什么值等

    {
      "query": {
        "bool": {
          "must": {
            "term": {
              "folder": "inbox"
            }
          },
          "must_not": {
            "term": {
              "tag": "spam"
            }
          },
          "should": [
            {
              "term": {
                "starred": true
              }
            },
            {
              "term": {
                "unread": true
              }
            }
          ],
          "filter": {
              "term": {
                "age": "33"
              }
            }
        }
      }
    }

综合应用

    GET students/students/_search
    {
      "query": {
        "bool": {
          "must_not": [
            {
              "term": {
                "name": "Brown"
              }
            }
          ],
          "must": [
            {
              "term": {
                "name": "Rice"
              }
            },
            {
              "term": {
                "countryCode": "BR"
              }
            },
            {
              "range": {
                "id": {
                  "gte": 1,
                  "lte": 20
                }
              }
            },
            {
              "exists" :{
                "field":"fullname"
              }
            }
          ],
          "should": [
            {
              "match": {
                "sentence": "was"
              }
            },{
              "match": {
                "hobby": "barketball"
              }
            }
          ]
        }
      }
    }
    
<a name="filter"></a>
### filter

filter 过滤不是查询, 过滤值是非常明确精准的匹配, 类似状态, 日期范围等, 返回结果不含分数评价, 需要明确的是filter是布尔查询的一部分

下列语句为一个类似and的查询

    GET students/_search
    {
      "query": {
        "bool": {
          "filter": [
            {
              "wildcard": {
                "name": "L*"
              }
            },
            {
              "term": {
                "sex": "famale"
              }
            },
            {
              "term": {
                "age": "33"
              }
            },
            {
              "range" :{
                "born_at":{
                  "lt":"2001-01-01 00:00:00"
                }
              }
            }
          ]
        }
      }
    }
    
<a name="query-dsl"></a>
## query dsl

<a name="match"></a>
### match

给定的搜索词分词, 然后搜索, 根据匹配度评分返回结果, 单字段的match建议使用term

    GET students/students/_search
    {
      "query": {
          "match": {
            "sentence": "Dormouse had"
          }
        },
        "highlight": {
          "fields": {
            "sentence": {}
          }
        }
    }

`Dormouse`和 `had`相关结构都会返回
<a name="highlight"></a>
> highlight高亮结果

<a name="match_phrase"></a>
### match_phrase

parase(短语)搜索和match很像, 但是他认为搜索内容是短语, 不会分词, 进匹配`Dormouse had`

    GET students/students/_search
    {
      "query": {
          "match": {
            "sentence": "Dormouse had"
          }
        },
        "highlight": {
          "fields": {
            "sentence": {}
          }
        }
    }

<a name="muti_match"></a>
### muti_match

多个字段中match同一个值

    {
      "query": {
          "multi_match": {
            "query": "had",
            "fields": ["sentence^3","name"]
          }
        },
    }
    
> 个别字段可以使用`^`加权, 3表示倍数

还有其他很重要的参数, 文档查询多字段内容, 计算分数查询相关度有重要的使用场景

<a name="fuzzy"></a>
### fuzzy

fuzzy 查询会计算与关键词的拼写相似程度， terms 查询会计算 找到的内容与关键词组成部分匹配的百分比


<a name="aggs"></a>
## 分析
Elasticsearch把这项功能叫做聚合(aggregations)，它允许你在数据基础上生成复杂的统计。它很像SQL中的 GROUP BY 但是功能更强大。

<a name="aggs-format"></a>
格式
```
...
"aggs":{
    "some_key" :{
        "AGGS_TYPE":{...},  // "term":{"field":"value"} 聚合规则, 分析方法
        "AGGS_TYPE":{...},
        "aggs":{// aggs操作, 不写默认为统计文档个数, 否则进入嵌套或者其他统计
             "some_key" :{}, // "avg_field":{"avg":{"field":"id"}}
             "some_key" :{
                "aggs":{...}//嵌套开始
             }
        }
    }
}
```


<a name="aggs-terms"></a>
### terms

按照字段分组, 统计数量

    GET students/students/_search
    {
      "aggs": {
        "hobby": {
          "terms": {
            "field": "hobby"
          }
        }
      }
    }

结果
    
    ...
    "aggregations": {
    "hobby": {
      "doc_count_error_upper_bound": 0,
      "sum_other_doc_count": 0,
      "buckets": [
        {
          "key": "pingbangball",
          "doc_count": 5
        },
        {
          "key": "football",
          "doc_count": 3
        },
        {
          "key": "barketball",
          "doc_count": 2
        }
      ]
    }

三次嵌套

    {
      "aggs": {
        "hobby_aggs": {
          "terms": {
            "field": "hobby"
          },
          "id_avg": {
              "avg": {
                "field": "id"
              }
            },
          "aggs": {
            "id_avg": {
              "avg": {
                "field": "id"
              }
            },
            "id_sum": {
              "sum": {
                "field": "id"
              }
            },
            "group_by_country": {
              "terms": {
                "field": "countryCode"
              },
              "aggs": {
                "id_avg": {
                  "avg": {
                    "field": "id"
                  }
                },
                "id_sum": {
                  "sum": {
                    "field": "id"
                  }
                }
              }
            }
          }
        }
      }
    }