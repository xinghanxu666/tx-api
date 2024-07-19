import React, { useEffect, useState } from 'react';

import { getFooterHTML, getSystemName } from '../helpers';
import { Layout, Tooltip } from '@douyinfe/semi-ui';

const Footer = () => {
  const systemName = getSystemName();
  const [footer, setFooter] = useState(getFooterHTML());
  let remainCheckTimes = 5;

  const loadFooter = () => {
    let footer_html = localStorage.getItem('footer_html');
    if (footer_html) {
      setFooter(footer_html);
    }
  };

  const defaultFooter = (
    <div className='custom-footer'>
      <a
        href='https://github.com/xinghanxu666/tx-api'
        target='_blank'
        rel='noreferrer'
      >
        天絮API {import.meta.env.VITE_REACT_APP_VERSION}{' '}
      </a>
      由{' '}
      <a
        href='https://github.com/xinghanxu666'
        target='_blank'
        rel='noreferrer'
      >
        xinghanxu
      </a>{' '}
      构建，基于{' '}
      <a
        href='https://github.com/Calcium-Ion/new-api'
        target='_blank'
        rel='noreferrer'
      >
        New Api
      </a>
    </div>
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (remainCheckTimes <= 0) {
        clearInterval(timer);
        return;
      }
      remainCheckTimes--;
      loadFooter();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <Layout.Content style={{ textAlign: 'center' }}>
        {footer ? (
          <Tooltip content={defaultFooter}>
            <div
              className='custom-footer'
              dangerouslySetInnerHTML={{ __html: footer }}
            ></div>
          </Tooltip>
        ) : (
          defaultFooter
        )}
      </Layout.Content>
    </Layout>
  );
};

export default Footer;
