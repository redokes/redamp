#!/user/bin/env python

import os
import sys
from gmusicapi.api import Api
def application(environ, start_response):
    status = '200 OK'
    output = 'Hello World! Yeah?'

    response_headers = [('Content-type', 'text/html'),
                        ('Content-Length', str(len(output)))]
    start_response(status, response_headers)

    return [output]
