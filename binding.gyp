{
	"targets": [{
		"target_name": "hdiutil",
		"include_dirs": ["<!(node -e \"require('nan')\")"],
		"conditions": [[
			'OS=="mac"',
			{
				"sources": ["hdiutil.mm"],
				"link_settings": {
					"libraries": ["-framework AppKit"]
				}
			}
		]]
	}]
}
