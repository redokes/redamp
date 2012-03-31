Ext.define('RedAmp.about.module.About', {
	extend: 'Lapidos.module.Viewable',
	
	//Config
	config: {
		name: 'about',
		title: 'About',
		viewCls: 'RedAmp.about.panel.About',
		menu:[{
			display: 'About',
			tags:['settings']
		}]
	}
});