import pathlib

p = pathlib.Path('c:/work/fintrade/fintrade-frontend/app/pages/MarketingHome.tsx')
c = p.read_text('utf-8')

# Remove Search Overlay
start_search = c.find('{/* Search Overlay */}')
end_search = c.find('{/* Utility Top Bar */}')
if start_search != -1 and end_search != -1:
    c = c[:start_search] + c[end_search:]

# Remove Utility Top Bar
start_top_bar = c.find('{/* Utility Top Bar */}')
end_top_bar = c.find('{/* Navbar */}')
if start_top_bar != -1 and end_top_bar != -1:
    c = c[:start_top_bar] + c[end_top_bar:]

# Remove Navbar
start_navbar = c.find('{/* Navbar */}')
end_navbar = c.find('{/* Ticker Strip - Now Sticky below Navbar */}')
if start_navbar != -1 and end_navbar != -1:
    c = c[:start_navbar] + c[end_navbar:]

# Remove Footer
start_footer = c.find('{/* Footer */}')
end_footer = c.find('{/* Download Brochure Dialog */}')
if start_footer != -1 and end_footer != -1:
    c = c[:start_footer] + c[end_footer:]

# Replace wrapper div
wrapper_orig = '''  return (
    <div className="min-h-screen" style={{
      background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F8F8F8 50%, #F4F4F4 100%)",
      position: "relative"
    }}>'''
wrapper_new = '''  return (
    <div className="flex-1 relative">'''
c = c.replace(wrapper_orig, wrapper_new)

p.write_text(c, 'utf-8')
