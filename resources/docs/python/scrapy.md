# scrapy

- [简单入门]('helloworld')

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

    
    

