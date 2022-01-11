# 🏝 napari-tissuumaps 🧫

[![License](https://img.shields.io/pypi/l/napari-tissuumaps.svg?color=green)](https://github.com/TissUUmaps/napari-tissuumaps/raw/master/LICENSE)
[![PyPI](https://img.shields.io/pypi/v/napari-tissuumaps.svg?color=green)](https://pypi.org/project/napari-tissuumaps)
[![Python Version](https://img.shields.io/pypi/pyversions/napari-tissuumaps.svg?color=green)](https://python.org)
[![tests](https://github.com/TissUUmaps/napari-tissuumaps/workflows/tests/badge.svg)](https://github.com/TissUUmaps/napari-tissuumaps/actions)
[![codecov](https://codecov.io/gh/TissUUmaps/napari-tissuumaps/branch/master/graph/badge.svg)](https://codecov.io/gh/TissUUmaps/napari-tissuumaps)

A Napari plugin to add compatibility with [TissUUmaps](https://tissuumaps.research.it.uu.se/).

----------------------------------

This plugins adds a new writer to [Napari] to export projects to [TissUUmaps](https://github.com/TissUUmaps/TissUUmaps). Exported projects can then be open on the browser or on a standalone GUI with [TissUUmaps](https://github.com/TissUUmaps/TissUUmaps). More information and demonstrations are available on the [TissUUmaps webpage](https://tissuumaps.research.it.uu.se/).

<!--
Don't miss the full getting started guide to set up your new package:
https://github.com/napari/cookiecutter-napari-plugin#getting-started

and review the napari docs for plugin developers:
https://napari.org/docs/plugins/index.html
-->

## 🚀 Features

<p align="center">
  <img src="images/screenshot.jpg" alt="Demonstration of a project exported from Napari to TissUUmaps." width="500" />
</p>

The plugin now supports:

* Exporting images
* Exporting labels
* Exporting points
* Exporting shapes, including:
    * Polygons
    * Rectangles
    * Lines
    * Paths
    * Ellipses

The plugin exports the right color for the points, shapes and labels and also saves the visibility/opacity of each layers. The shapes are exported in the GeoJSON format, the points in CSV files, and images as TIFFs.

## 📺 Installation

You can install `napari-tissuumaps` via [pip]:

    pip install napari-tissuumaps

You can also install `napari-tissumaps` via [napari]:

In Napari, access the menubar, Plugins > Install/Uninstall Plugins.
Search for napari-tissuumaps in the list and choose install, or type
`napari-tissuumaps` in the "install by name/url, or drop file..." text area and choose
install.

## ⛏ Usage

To export a project for TissUUmaps, access the menubar, File > Save All Layers... and
choose a filename with a `.tmap` extension. It will create a folder containing all the
necessary files for TissUUmaps.

## 📚 Documentation

Install pdoc with `pip install pdoc` and run the `docs/generate_doc.sh` script from the root. It will generate a static website that contains the documentation in the `docs` folder.

## 👩‍💻 Contributing

Contributions are very welcome. Tests can be run with [tox], please ensure
the coverage at least stays the same before you submit a pull request.

## ⚖️ License

Distributed under the terms of the [MIT] license,
"napari-tissuumaps" is free and open source software

## 🚒 Issues

If you encounter any problems, please [file an issue] along with a detailed description.

[napari]: https://github.com/napari/napari
[Cookiecutter]: https://github.com/audreyr/cookiecutter
[@napari]: https://github.com/napari
[MIT]: http://opensource.org/licenses/MIT
[BSD-3]: http://opensource.org/licenses/BSD-3-Clause
[GNU GPL v3.0]: http://www.gnu.org/licenses/gpl-3.0.txt
[GNU LGPL v3.0]: http://www.gnu.org/licenses/lgpl-3.0.txt
[Apache Software License 2.0]: http://www.apache.org/licenses/LICENSE-2.0
[Mozilla Public License 2.0]: https://www.mozilla.org/media/MPL/2.0/index.txt
[cookiecutter-napari-plugin]: https://github.com/napari/cookiecutter-napari-plugin

[file an issue]: https://github.com/TissUUmaps/napari-tissuumaps/issues

[napari]: https://github.com/napari/napari
[tox]: https://tox.readthedocs.io/en/latest/
[pip]: https://pypi.org/project/pip/
[PyPI]: https://pypi.org/
