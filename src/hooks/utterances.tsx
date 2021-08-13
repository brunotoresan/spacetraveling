import React from 'react'

export const useUtterances = (commentNodeId: string, theme: string) => {
	React.useEffect(() => {
		const scriptParentNode = document.getElementById(commentNodeId)
		if (!scriptParentNode) return

		// docs - https://utteranc.es/
		const script = document.createElement('script')
		script.src = 'https://utteranc.es/client.js'
		script.async = true
		script.setAttribute('repo', 'brunotoresan/spacetraveling')
		script.setAttribute('issue-term', 'pathname')
		script.setAttribute('label', 'post comment')
		script.setAttribute('theme', theme)
		script.setAttribute('crossorigin', 'anonymous')

		scriptParentNode.appendChild(script)

		return () => {
			// cleanup - remove the older script with previous theme
			scriptParentNode.removeChild(scriptParentNode.firstChild as Node)
		}
	}, [commentNodeId, theme])
}
