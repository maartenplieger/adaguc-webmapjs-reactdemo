module.exports = function (api) {
  const presets = [
    "@babel/preset-env",
    "@babel/preset-react"
  ];
  const plugins =  [
    "react-hot-loader/babel"
  ];
  
  api.cache(false);
  
  return {
    presets,
    plugins
  };
}
