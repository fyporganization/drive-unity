export default function ActionsPanel() {
  return (
    <>
      <div className="bg-white rounded-lg p-4 shadow flex flex-col items-start">
        <div className="font-bold mb-2">Identify Unused Files</div>
        <div className="text-sm text-gray-500 mb-4">Discover files that haven't been accessed in months and free up space.</div>
        <button className="mt-auto bg-blue-600 text-white py-1 px-4 rounded">Analyze Now</button>
      </div>
      <div className="bg-white rounded-lg p-4 shadow flex flex-col items-start">
        <div className="font-bold mb-2">Optimize Storage</div>
        <div className="text-sm text-gray-500 mb-4">Get smart suggestions to compress, categorize, and deduplicate your data.</div>
        <button className="mt-auto bg-blue-600 text-white py-1 px-4 rounded">Start Optimization</button>
      </div>
      <div className="bg-white rounded-lg p-4 shadow flex flex-col items-start">
        <div className="font-bold mb-2">Generate Smart Reports</div>
        <div className="text-sm text-gray-500 mb-4">Create AI-powered reports on usage patterns, compliance, and cost efficiency.</div>
        <button className="mt-auto bg-blue-600 text-white py-1 px-4 rounded">Create Report</button>
      </div>
    </>
  );
}
