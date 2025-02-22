# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = "Burr"
copyright = "2024, Elijah ben Izzy, Stefan Krawczyk"
author = "Elijah ben Izzy, Stefan Krawczyk"

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.autosummary",
    "myst_parser",
    "sphinx_sitemap",
    "sphinx_toolbox.collapse",
]

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

html_theme = "furo"
html_static_path = ["_static"]

html_title = "Burr"
html_theme_options = {
    "source_repository": "https://github.com/dagworks-inc/burr",
    "source_branch": "main",
    "source_directory": "docs/",
    "light_css_variables": {
        "color-announcement-background": "#ffba00",
        "color-announcement-text": "#091E42",
    },
    "dark_css_variables": {
        "color-announcement-background": "#ffba00",
        "color-announcement-text": "#091E42",
    },
}

html_baseurl = "https://burr.dagworks.io/en/latest/"  # TODO -- update this

exclude_patterns = ["README-internal.md"]

autodoc_typehints_format = "short"
python_maximum_signature_line_length = 100
python_use_unqualified_type_names = True
