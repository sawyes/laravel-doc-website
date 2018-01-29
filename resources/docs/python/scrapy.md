# scrapy

- [安装](#install)
    - [conda安装](#conda-install)
- [简单入门](#helloworld)
- [编码设置](#setting-encoding)

<a name='install'></a>
## 安装
[install](https://docs.scrapy.org/en/latest/intro/install.html)

<a name='conda-install'></a>
### conda安装

If you’re using `Anaconda` or `Miniconda`, you can install the package from the conda-forge channel, which has up-to-date packages for Linux, Windows and OS X.

使用conda安装

    conda install -c conda-forge scrapy

<a name='helloworld'></a>
## 简单入门

创建scrapy项目

    scrapy startproject baidu

查看目录结构

    baidu/
    ├── baidu 项目模块
    │   ├── __init__.py
    │   ├── items.py
    │   ├── middlewares.py
    │   ├── pipelines.py
    │   ├── settings.py   # 项目公共配置文件
    │   └── spiders      # 爬虫目录
    │       ├── baidu.py 自定义开发文件
    │       ├── __init__.py
    │       └── __init__.pyc
    └── scrapy.cfg  # 开发配置文件
    
 
关闭robot设置
    
    cd baidu/baidu/
    
    egrep -v "#|^$" settings.py
    BOT_NAME = 'baidu'
    SPIDER_MODULES = ['baidu.spiders']
    NEWSPIDER_MODULE = 'baidu.spiders'
    ROBOTSTXT_OBEY = False   # 关闭
    USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
    FEED_EXPORT_ENCODING = 'utf-8' # 中文默认编码

简单查看百度页面

    from scrapy import Spider
    
    class Baidu(Spider):
        ''' 设置项目名称 '''
        name = 'baidu'
    
        start_urls = ['https://www.baidu.com/']
    
        def parse(self, response):
            print(response.body)

运行爬虫
    
    # ProjectName/ProjectName/spiders
    scrapy crawl baidu --nolog | egrep -v '^$'
    
    
### 获取网页中的内容

    from scrapy import Spider
    
    class Baidu(Spider):
        name = 'baidu'
        start_urls = ['https://www.baidu.com/']
        def parse(self, response):
            '''print(help(response.body))'''
            for a_text in response.xpath('//ul/li'):
                text = a_text.xpath('a/text()').extract()
                link = a_text.xpath('a/@href').extract()
                if (''.join(text).strip()!=''):
                     print ('title: %s, url %s'%(''.join(text), ''.join(link)))

    
### 递归获取

官网示例

```
    import scrapy

    class QuotesSpider(scrapy.Spider):    name = "quotes"
        start_urls = [ 
            'http://quotes.toscrape.com/page/1/',
        ]   
    
        def parse(self, response):
            for quote in response.css('div.quote'):
                yield {
                    'text': quote.css('span.text::text').extract_first(),
                    'author': quote.css('small.author::text').extract_first(),                'tags': quote.css('div.tags a.tag::text').extract(),
                }   
            for a in response.css('li.next a'):
                yield response.follow(a, callback=self.parse)
```

新闻网站实例, 获取最新动态新闻, 打开链接获取其内容
```
   import scrapy
   
   class QuotesSpider(scrapy.Spider):
       name = "quotes"
       start_urls = [
           'http://www.199it.com/newly',
       ]
   
       def parse(self, response):
           for a in response.xpath('//article/.//h2/a'):
               yield response.follow(a, callback=self.parse_article)
   
       def parse_article(self, response):
           def extract_with_css(query):
               if response.css(query).extract_first() is not None:
                   return response.css(query).extract_first().strip()
   
           yield {
               'title': extract_with_css('h1.entry-title::text')
           }
``` 

<a name='setting-encoding'></a>
## 编码设置

中文默认是Unicode,如:

    \u5317\u4eac\u5927\u5b66


在setting文件中设置：

    FEED_EXPORT_ENCODING = 'utf-8'



