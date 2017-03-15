Vue.component('autocomplete-input', {
template: '#autocomplete-input-template',
props: {
  options: {
    type: Array,
    required: true
  }
},
data() {
  return {
    isOpen: false,
    highlightedPosition: 0,
    keyword: ''
  }
},
computed: {
  fOptions() {
    const re = new RegExp(this.keyword, 'i')
    return this.options.filter(o => o.title.match(re))
  }
},
methods: {
  onInput(value) {
      this.highlightedPosition = 0
      this.isOpen = !!value
    },
    moveDown() {
      if (!this.isOpen) {
        return
      }
      this.highlightedPosition =
        (this.highlightedPosition + 1) % this.fOptions.length
    },
    moveUp() {
      if (!this.isOpen) {
        return
      }
      this.highlightedPosition = this.highlightedPosition - 1 < 0 ? this.fOptions.length - 1 : this.highlightedPosition - 1
    },
    select() {
      const selectedOption = this.fOptions[this.highlightedPosition]
      this.$emit('select', selectedOption)
      this.isOpen = false
      this.keyword = selectedOption.title
    }
}
});